'use strict';

const { Product, Store, User } = require('../models');
const { evaluate }  = require('../utils/policy-engine');
const { logAction } = require('../utils/logger.utils');
const { validationResult } = require('express-validator');
const { Op }        = require('sequelize');

// ─── Listar productos (ABAC aplicado en query) ────────────
async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, search, tienda_id, es_premium, categoria } = req.query;
    const offset = (page - 1) * limit;

    const where = { activo: true };

    // Filtros opcionales
    if (search)    where.nombre    = { [Op.like]: `%${search}%` };
    if (categoria) where.categoria = categoria;
    if (es_premium !== undefined) where.es_premium = es_premium === 'true';

    const roles     = req.user.roles;
    const isAdmin   = roles.includes('ADMIN');
    const isAuditor = roles.includes('AUDITOR');

    // ABAC a nivel de query: GERENTE y EMPLEADO solo ven su tienda
    console.log(req.user);
    
    if (!isAdmin && !isAuditor) {
      if (!req.user.tienda_id) {
        return res.status(403).json({ success: false, message: 'Usuario no tiene tienda asignada' });
      }
      where.tienda_id = req.user.tienda_id;
    } else if (tienda_id) {
      where.tienda_id = tienda_id;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit : parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Store, as: 'tienda',  attributes: ['id', 'nombre'] },
        { model: User,  as: 'creador', attributes: ['id', 'nombre'] },
      ],
      order: [['creado_en', 'DESC']],
    });

    await logAction({ usuarioId: req.userId, accion: 'LISTAR_PRODUCTOS', recurso: 'productos', ip: req.ip });

    return res.status(200).json({
      success: true,
      data   : rows,
      meta   : { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Obtener uno ──────────────────────────────────────────
async function getById(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Store, as: 'tienda',  attributes: ['id', 'nombre'] },
        { model: User,  as: 'creador', attributes: ['id', 'nombre'] },
      ],
    });
    if (!product || !product.activo) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Verificar política SELECT
    const { allowed, reason } = evaluate('SELECT', req.user, product.toJSON());
    if (!allowed) {
      await logAction({ usuarioId: req.userId, accion: 'VER_PRODUCTO_DENEGADO', recursoId: product.id, ip: req.ip, resultado: 'DENEGADO' });
      return res.status(403).json({ success: false, message: reason });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// ─── Crear producto ───────────────────────────────────────
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { nombre, descripcion, precio, stock, categoria, es_premium, tienda_id } = req.body;

    const product = await Product.create({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      es_premium: es_premium || false,
      tienda_id,
      creado_por: req.userId,
    });

    await logAction({
      usuarioId: req.userId,
      accion   : 'CREAR_PRODUCTO',
      recurso  : 'productos',
      recursoId: product.id,
      detalle  : { nombre, tienda_id, es_premium },
      ip       : req.ip,
    });

    return res.status(201).json({ success: true, message: 'Producto creado', data: product });
  } catch (err) {
    next(err);
  }
}

// ─── Actualizar producto ──────────────────────────────────
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const product = await Product.findByPk(req.params.id);
    if (!product || !product.activo) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // El middleware ABAC ya validó la política; solo aplicar campos permitidos
    const roles      = req.user.roles;
    const isAdmin    = roles.includes('ADMIN');
    const isGerente  = roles.includes('GERENTE');
    const isEmpleado = roles.includes('EMPLEADO');

    const updateData = {};

    if (isAdmin) {
      // Puede actualizar todo
      const { nombre, descripcion, precio, stock, categoria, es_premium, tienda_id, activo } = req.body;
      if (nombre      !== undefined) updateData.nombre      = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (precio      !== undefined) updateData.precio      = precio;
      if (stock       !== undefined) updateData.stock       = stock;
      if (categoria   !== undefined) updateData.categoria   = categoria;
      if (es_premium  !== undefined) updateData.es_premium  = es_premium;
      if (tienda_id   !== undefined) updateData.tienda_id   = tienda_id;
      if (activo      !== undefined) updateData.activo      = activo;
    } else if (isGerente) {
      // Todo excepto categoría
      const { nombre, descripcion, precio, stock, es_premium, activo } = req.body;
      if (nombre      !== undefined) updateData.nombre      = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (precio      !== undefined) updateData.precio      = precio;
      if (stock       !== undefined) updateData.stock       = stock;
      if (es_premium  !== undefined) updateData.es_premium  = es_premium;
      if (activo      !== undefined) updateData.activo      = activo;
    } else if (isEmpleado) {
      // Solo stock
      if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Ningún campo permitido para actualizar' });
    }

    await product.update(updateData);
    await logAction({
      usuarioId: req.userId,
      accion   : 'ACTUALIZAR_PRODUCTO',
      recurso  : 'productos',
      recursoId: product.id,
      detalle  : updateData,
      ip       : req.ip,
    });

    return res.status(200).json({ success: true, message: 'Producto actualizado', data: product });
  } catch (err) {
    next(err);
  }
}

// ─── Eliminar producto (soft delete) ─────────────────────
async function remove(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product || !product.activo) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    await product.update({ activo: false });
    await logAction({
      usuarioId: req.userId,
      accion   : 'ELIMINAR_PRODUCTO',
      recurso  : 'productos',
      recursoId: product.id,
      ip       : req.ip,
    });

    return res.status(200).json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
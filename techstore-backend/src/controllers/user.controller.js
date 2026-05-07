'use strict';

const bcrypt        = require('bcryptjs');
const { User, Role, Store, ActionLog } = require('../models');
const { logAction } = require('../utils/logger.utils');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// ─── Listar usuarios ──────────────────────────────────────
async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, search, activo } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email : { [Op.like]: `%${search}%` } },
      ];
    }
    if (activo !== undefined) where.activo = activo === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit : parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Role,  as: 'roles',  attributes: ['id', 'nombre'], through: { attributes: [] } },
        { model: Store, as: 'tienda', attributes: ['id', 'nombre'] },
      ],
      order: [['creado_en', 'DESC']],
    });

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
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role,  as: 'roles',  attributes: ['id', 'nombre'], through: { attributes: [] } },
        { model: Store, as: 'tienda', attributes: ['id', 'nombre'] },
      ],
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Crear usuario ────────────────────────────────────────
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { nombre, email, password, tienda_id, roles: roleNames = ['EMPLEADO'] } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'El email ya está registrado' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ nombre, email, password_hash, tienda_id: tienda_id || null });

    // Asignar roles
    const rolesToAssign = await Role.findAll({ where: { nombre: roleNames } });
    if (rolesToAssign.length) await user.setRoles(rolesToAssign);

    await logAction({ usuarioId: req.userId, accion: 'CREAR_USUARIO', recurso: 'usuarios', recursoId: user.id, ip: req.ip });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado',
      data   : { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Actualizar usuario ───────────────────────────────────
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const user = await User.scope('full').findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const { nombre, email, password, tienda_id, activo } = req.body;
    const updateData = {};

    if (nombre)    updateData.nombre    = nombre;
    if (email)     updateData.email     = email;
    if (tienda_id !== undefined) updateData.tienda_id = tienda_id;
    if (activo    !== undefined) updateData.activo    = activo;
    if (password) updateData.password_hash = await bcrypt.hash(password, 12);

    await user.update(updateData);
    await logAction({ usuarioId: req.userId, accion: 'ACTUALIZAR_USUARIO', recurso: 'usuarios', recursoId: user.id, ip: req.ip });

    return res.status(200).json({ success: true, message: 'Usuario actualizado', data: { id: user.id } });
  } catch (err) {
    next(err);
  }
}

// ─── Eliminar (desactivar) usuario ────────────────────────
async function remove(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.id === req.userId) return res.status(400).json({ success: false, message: 'No puedes desactivarte a ti mismo' });

    await user.update({ activo: false });
    await logAction({ usuarioId: req.userId, accion: 'DESACTIVAR_USUARIO', recurso: 'usuarios', recursoId: user.id, ip: req.ip });

    return res.status(200).json({ success: true, message: 'Usuario desactivado' });
  } catch (err) {
    next(err);
  }
}

// ─── Asignar roles ────────────────────────────────────────
async function assignRoles(req, res, next) {
  try {
    const { roles: roleNames } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const roles = await Role.findAll({ where: { nombre: roleNames } });
    await user.setRoles(roles);

    await logAction({
      usuarioId: req.userId,
      accion   : 'ASIGNAR_ROLES',
      recurso  : 'usuarios',
      recursoId: user.id,
      detalle  : { roles: roleNames },
      ip       : req.ip,
    });

    return res.status(200).json({ success: true, message: 'Roles asignados correctamente' });
  } catch (err) {
    next(err);
  }
}

// ─── Logs de acciones ─────────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await ActionLog.findAndCountAll({
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      limit : parseInt(limit),
      offset: parseInt(offset),
      order : [['creado_en', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data   : rows,
      meta   : { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, assignRoles, getLogs };
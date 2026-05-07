'use strict';

const { Role }      = require('../models');
const { logAction } = require('../utils/logger.utils');
const { validationResult } = require('express-validator');

async function getAll(req, res, next) {
  try {
    const roles = await Role.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json({ success: true, data: roles });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    return res.status(200).json({ success: true, data: role });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { nombre, descripcion } = req.body;
    const role = await Role.create({ nombre: nombre.toUpperCase(), descripcion });

    await logAction({ usuarioId: req.userId, accion: 'CREAR_ROL', recurso: 'roles', recursoId: role.id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Rol creado', data: role });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });

    const { nombre, descripcion, activo } = req.body;
    await role.update({ nombre: nombre?.toUpperCase() || role.nombre, descripcion, activo });

    await logAction({ usuarioId: req.userId, accion: 'ACTUALIZAR_ROL', recurso: 'roles', recursoId: role.id, ip: req.ip });
    return res.status(200).json({ success: true, message: 'Rol actualizado', data: role });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });

    const rolesBase = ['ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR'];
    if (rolesBase.includes(role.nombre)) {
      return res.status(400).json({ success: false, message: 'No se pueden eliminar los roles base del sistema' });
    }

    await role.update({ activo: false });
    await logAction({ usuarioId: req.userId, accion: 'ELIMINAR_ROL', recurso: 'roles', recursoId: role.id, ip: req.ip });
    return res.status(200).json({ success: true, message: 'Rol desactivado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
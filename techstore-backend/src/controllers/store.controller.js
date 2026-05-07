'use strict';

const { Store }     = require('../models');
const { logAction } = require('../utils/logger.utils');

async function getAll(req, res, next) {
  try {
    const stores = await Store.findAll({ where: { activa: true }, order: [['nombre', 'ASC']] });
    return res.status(200).json({ success: true, data: stores });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Tienda no encontrada' });
    return res.status(200).json({ success: true, data: store });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre, direccion, ciudad } = req.body;
    const store = await Store.create({ nombre, direccion, ciudad });
    await logAction({ usuarioId: req.userId, accion: 'CREAR_TIENDA', recurso: 'tiendas', recursoId: store.id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Tienda creada', data: store });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Tienda no encontrada' });

    const { nombre, direccion, ciudad, activa } = req.body;
    await store.update({ nombre, direccion, ciudad, activa });
    await logAction({ usuarioId: req.userId, accion: 'ACTUALIZAR_TIENDA', recurso: 'tiendas', recursoId: store.id, ip: req.ip });
    return res.status(200).json({ success: true, message: 'Tienda actualizada', data: store });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Tienda no encontrada' });
    await store.update({ activa: false });
    await logAction({ usuarioId: req.userId, accion: 'DESACTIVAR_TIENDA', recurso: 'tiendas', recursoId: store.id, ip: req.ip });
    return res.status(200).json({ success: true, message: 'Tienda desactivada' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
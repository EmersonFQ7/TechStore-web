'use strict';

const { ActionLog } = require('../models');

/**
 * Registra una acción en la tabla logs_acciones.
 *
 * @param {object} options
 * @param {number|null}  options.usuarioId
 * @param {string}       options.accion
 * @param {string|null}  options.recurso
 * @param {number|null}  options.recursoId
 * @param {object|null}  options.detalle
 * @param {string|null}  options.ip
 * @param {string}       options.resultado  'EXITOSO' | 'DENEGADO' | 'ERROR'
 */
async function logAction({
  usuarioId  = null,
  accion,
  recurso    = null,
  recursoId  = null,
  detalle    = null,
  ip         = null,
  resultado  = 'EXITOSO',
}) {
  try {
    await ActionLog.create({
      usuario_id: usuarioId,
      accion,
      recurso,
      recurso_id: recursoId,
      detalle,
      ip,
      resultado,
    });
  } catch (err) {
    // No rompemos el flujo principal si falla el logging
    console.error('[Logger] Error al guardar log:', err.message);
  }
}

module.exports = { logAction };
'use strict';

const { evaluate }  = require('../utils/policy-engine');
const { logAction } = require('../utils/logger.utils');
const { Product }   = require('../models');

/**
 * checkAbac(action, getResource?)
 *
 * Middleware factory ABAC. Evalúa la política para la acción dada.
 *
 * `getResource` es una función async(req) que devuelve los atributos
 * del recurso necesarios para la evaluación.
 *
 * Si no se proporciona, solo se evalúan los atributos del cuerpo de la petición.
 */
function checkAbac(action, getResource) {
  return async (req, res, next) => {
    try {
      let resource = {};

      if (getResource) {
        resource = await getResource(req);
      } else {
        // Extraer atributos relevantes del body para INSERT
        resource = {
          tienda_id : req.body.tienda_id  || req.query.tienda_id,
          es_premium: req.body.es_premium || false,
          campo     : req.body._campo,      // campo que se quiere actualizar
        };
      }

      const { allowed, reason } = evaluate(action, req.user, resource);

      if (!allowed) {
        await logAction({
          usuarioId: req.userId,
          accion   : `ABAC_DENEGADO_${action}`,
          recurso  : 'productos',
          recursoId: resource.id,
          detalle  : { reason, resource: { tienda_id: resource.tienda_id, es_premium: resource.es_premium } },
          ip       : req.ip,
          resultado: 'DENEGADO',
        });

        return res.status(403).json({
          success: false,
          message: `Acceso denegado (ABAC): ${reason}`,
        });
      }

      req.abacResource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Carga el producto desde BD y lo adjunta como recurso ABAC.
 * Usa el id del parámetro de ruta.
 */
async function loadProductResource(req) {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    const err  = new Error('Producto no encontrado');
    err.status = 404;
    throw err;
  }
  return product.toJSON();
}

/**
 * Carga el producto y adjunta el campo que se intenta actualizar.
 */
async function loadProductResourceForUpdate(req) {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    const err  = new Error('Producto no encontrado');
    err.status = 404;
    throw err;
  }
  const resource    = product.toJSON();
  // El cliente puede indicar qué campo principal modifica
  resource.campo    = req.body._campo || detectMainField(req.body);
  return resource;
}

/**
 * Detecta el campo más relevante que se actualiza.
 */
function detectMainField(body) {
  const fields = Object.keys(body).filter(k => k !== '_campo');
  if (fields.includes('categoria'))           return 'categoria';
  if (fields.includes('stock') && fields.length === 1) return 'stock';
  return fields[0] || 'desconocido';
}

module.exports = {
  checkAbac,
  loadProductResource,
  loadProductResourceForUpdate,
};
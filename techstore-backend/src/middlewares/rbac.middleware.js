'use strict';

const { logAction } = require('../utils/logger.utils');

/**
 * requireRoles(...roles)
 * Middleware factory que verifica si el usuario tiene al menos uno de los roles
 * indicados. Requiere que authMiddleware haya corrido antes.
 *
 * Uso: router.get('/admin', auth, requireRoles('ADMIN'), controller)
 */
function requireRoles(...allowedRoles) {
  return async (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole   = allowedRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      await logAction({
        usuarioId: req.userId,
        accion   : 'ACCESO_DENEGADO_RBAC',
        recurso  : req.path,
        detalle  : { rolesRequeridos: allowedRoles, rolesUsuario: userRoles },
        ip       : req.ip,
        resultado: 'DENEGADO',
      });

      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { requireRoles };
'use strict';

const { verifyToken }  = require('../utils/jwt.utils');
const { User, Role }   = require('../models');

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>
 * y adjunta el usuario completo (con roles) en req.user.
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Cargar usuario fresco desde BD con sus roles
    const user = await User.unscoped().findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'mfa_secret'] },
      include: [{
        model: Role,
        as   : 'roles',
        attributes: ['id', 'nombre'],
        through: { attributes: [] },
      }],
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo o no encontrado',
      });
    }

    // Normalizar roles a array de nombres
    req.user       = user.toJSON();
    req.user.roles = user.roles.map(r => r.nombre);
    req.userId     = user.id;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    next(err);
  }
}

module.exports = authMiddleware;
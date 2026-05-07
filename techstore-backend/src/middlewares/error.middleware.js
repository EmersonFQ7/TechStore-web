'use strict';

/**
 * Middleware global de manejo de errores.
 * Debe ser el último middleware registrado en Express.
 */
function errorMiddleware(err, req, res, _next) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors?.map(e => e.message) || [err.message];
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors : messages,
    });
  }

  // Error de FK de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Error de integridad referencial: el recurso está relacionado con otros datos',
    });
  }

  // Error con status definido explícitamente
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
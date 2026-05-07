'use strict';

require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const { sequelize } = require('./src/models');
const routes        = require('./src/routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Seguridad ────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin : process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logger ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rutas API ────────────────────────────────────────────
app.use('/api', routes);

// ─── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Manejo global de errores ─────────────────────────────
app.use(errorMiddleware);

// ─── Inicio ───────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  Conexión a MySQL establecida correctamente.');

    // Solo sincroniza en desarrollo; en producción usa migraciones
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅  Modelos sincronizados.');
    }

    app.listen(PORT, () => {
      console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌  No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
})();

module.exports = app;
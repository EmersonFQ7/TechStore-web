'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/user.controller');
const auth       = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/rbac.middleware');
const { body }   = require('express-validator');

const createValidation = [
  body('nombre').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

router.use(auth); // Todas las rutas requieren autenticación

router.get ('/',              requireRoles('ADMIN'),                         controller.getAll);
router.get ('/logs',          requireRoles('ADMIN', 'AUDITOR'),              controller.getLogs);
router.get ('/:id',           requireRoles('ADMIN', 'GERENTE'),              controller.getById);
router.post('/',              requireRoles('ADMIN'), createValidation,       controller.create);
router.put ('/:id',           requireRoles('ADMIN'),                         controller.update);
router.delete('/:id',         requireRoles('ADMIN'),                         controller.remove);
router.post('/:id/roles',     requireRoles('ADMIN'),                         controller.assignRoles);

module.exports = router;
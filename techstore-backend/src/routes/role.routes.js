'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/role.controller');
const auth       = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/rbac.middleware');
const { body }   = require('express-validator');

router.use(auth);

router.get ('/',     requireRoles('ADMIN', 'GERENTE', 'AUDITOR'), controller.getAll);
router.get ('/:id',  requireRoles('ADMIN'),                       controller.getById);
router.post('/',     requireRoles('ADMIN'), [body('nombre').trim().notEmpty()], controller.create);
router.put ('/:id',  requireRoles('ADMIN'),                       controller.update);
router.delete('/:id',requireRoles('ADMIN'),                       controller.remove);

module.exports = router;
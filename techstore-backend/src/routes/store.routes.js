'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/store.controller');
const auth       = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/rbac.middleware');

router.use(auth);

router.get ('/',     requireRoles('ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR'), controller.getAll);
router.get ('/:id',  requireRoles('ADMIN', 'GERENTE', 'AUDITOR'),             controller.getById);
router.post('/',     requireRoles('ADMIN'),                                    controller.create);
router.put ('/:id',  requireRoles('ADMIN'),                                    controller.update);
router.delete('/:id',requireRoles('ADMIN'),                                    controller.remove);

module.exports = router;
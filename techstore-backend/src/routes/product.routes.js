'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/product.controller');
const auth       = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/rbac.middleware');
const { checkAbac, loadProductResource, loadProductResourceForUpdate } = require('../middlewares/abac.middleware');
const { body }   = require('express-validator');

const createValidation = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('tienda_id').isInt({ min: 1 }).withMessage('Tienda requerida'),
];

router.use(auth);
router.use(requireRoles('ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR'));

router.get ('/',     checkAbac('SELECT'),                                              controller.getAll);
router.get ('/:id',  checkAbac('SELECT', loadProductResource),                         controller.getById);
router.post('/',     checkAbac('INSERT'), createValidation,                             controller.create);
router.put ('/:id',  checkAbac('UPDATE', loadProductResourceForUpdate),                 controller.update);
router.delete('/:id',checkAbac('DELETE', loadProductResource),                         controller.remove);

module.exports = router;
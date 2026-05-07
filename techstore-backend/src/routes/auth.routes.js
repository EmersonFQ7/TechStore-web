'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');
const auth       = require('../middlewares/auth.middleware');
const { body }   = require('express-validator');

const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe contener al menos una mayúscula y un número'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Password requerido'),
];

router.post('/register',      registerValidation, controller.register);
router.post('/login',         loginValidation,    controller.login);
router.post('/mfa/verify',                        controller.verifyMfa);
router.get ('/profile',       auth,               controller.getProfile);
router.post('/mfa/setup',     auth,               controller.setupMfa);
router.post('/mfa/confirm',   auth,               controller.confirmMfa);
router.post('/mfa/disable',   auth,               controller.disableMfa);

module.exports = router;
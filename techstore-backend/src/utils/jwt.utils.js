'use strict';

const jwt = require('jsonwebtoken');

const SECRET      = process.env.JWT_SECRET      || 'cambiar_en_produccion_secreto_muy_largo';
const EXPIRES_IN  = process.env.JWT_EXPIRES_IN  || '8h';
const SECRET_MFA  = process.env.JWT_MFA_SECRET  || 'mfa_temp_secreto_muy_largo';
const MFA_EXPIRES = process.env.JWT_MFA_EXPIRES || '5m';

/**
 * Genera el token JWT principal con datos del usuario y sus roles.
 */
function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verifica el token JWT principal.
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Genera un token temporal pre-MFA (corta duración).
 */
function generateMfaTempToken(payload) {
  return jwt.sign(payload, SECRET_MFA, { expiresIn: MFA_EXPIRES });
}

/**
 * Verifica el token temporal pre-MFA.
 */
function verifyMfaTempToken(token) {
  return jwt.verify(token, SECRET_MFA);
}

module.exports = {
  generateToken,
  verifyToken,
  generateMfaTempToken,
  verifyMfaTempToken,
};
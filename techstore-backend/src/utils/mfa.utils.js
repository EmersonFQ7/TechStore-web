'use strict';

const speakeasy = require('speakeasy');
const QRCode    = require('qrcode');

const APP_NAME = process.env.APP_NAME || 'TechStore';

/**
 * Genera un secreto TOTP para el usuario.
 * Retorna { base32, otpauth_url }
 */
function generateSecret(userEmail) {
  const secret = speakeasy.generateSecret({
    name  : `${APP_NAME} (${userEmail})`,
    length: 20,
  });
  return {
    base32     : secret.base32,
    otpauth_url: secret.otpauth_url,
  };
}

/**
 * Genera la imagen QR en formato Data URL (base64) a partir de la URL OTPAuth.
 */
async function generateQRCode(otpauth_url) {
  return await QRCode.toDataURL(otpauth_url);
}

/**
 * Verifica un token TOTP ingresado por el usuario.
 */
function verifyToken(token, secret) {
  return speakeasy.totp.verify({
    secret  : secret,
    encoding: 'base32',
    token   : String(token).replace(/\s/g, ''),
    window  : 1, // ±30s de tolerancia
  });
}

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
};
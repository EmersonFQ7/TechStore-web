'use strict';

const bcrypt        = require('bcryptjs');
const { v4: uuid }  = require('uuid');
const { User, Role, MfaTempToken } = require('../models');
const jwtUtils      = require('../utils/jwt.utils');
const mfaUtils      = require('../utils/mfa.utils');
const { logAction } = require('../utils/logger.utils');
const { validationResult } = require('express-validator');

// ─── Registro ─────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nombre, email, password, tienda_id } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      nombre,
      email,
      password_hash,
      tienda_id: tienda_id || null,
    });

    // Asignar rol EMPLEADO por defecto
    const empleadoRole = await Role.findOne({ where: { nombre: 'EMPLEADO' } });
    if (empleadoRole) {
      await user.addRole(empleadoRole); // a través del alias de la relación
    }

    await logAction({
      usuarioId: user.id,
      accion   : 'REGISTRO',
      recurso  : 'usuarios',
      recursoId: user.id,
      ip       : req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data   : { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Login ────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.scope('full').findOne({
      where  : { email, activo: true },
      include: [{ model: Role, as: 'roles', attributes: ['id', 'nombre'], through: { attributes: [] } }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      await logAction({ usuarioId: user.id, accion: 'LOGIN_FALLIDO', ip: req.ip, resultado: 'DENEGADO' });
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Si MFA está habilitado → emitir token temporal
    if (user.mfa_habilitado) {
      const tempToken = jwtUtils.generateMfaTempToken({ id: user.id, mfaRequired: true });

      // Guardar en BD para invalidación posterior
      const expiraEn = new Date(Date.now() + 5 * 60 * 1000); // 5 min
      await MfaTempToken.create({
        usuario_id: user.id,
        token     : tempToken,
        expira_en : expiraEn,
      });

      return res.status(200).json({
        success    : true,
        mfaRequired: true,
        tempToken,
        message    : 'Ingresa el código MFA para continuar',
      });
    }

    // Sin MFA → emitir token final
    const roles = user.roles.map(r => r.nombre);
    const token = jwtUtils.generateToken({
      id      : user.id,
      email   : user.email,
      roles,
      tienda_id: user.tienda_id,
    });

    await user.update({ ultimo_login: new Date() });
    await logAction({ usuarioId: user.id, accion: 'LOGIN_EXITOSO', ip: req.ip });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id      : user.id,
        nombre  : user.nombre,
        email   : user.email,
        roles,
        tienda_id: user.tienda_id,
        mfa_habilitado: user.mfa_habilitado,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Verificar MFA ────────────────────────────────────────
async function verifyMfa(req, res, next) {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ success: false, message: 'Token temporal y código MFA requeridos' });
    }

    let decoded;
    try {
      decoded = jwtUtils.verifyMfaTempToken(tempToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Token temporal inválido o expirado' });
    }

    // Verificar que el token no fue usado ya
    const mfaRecord = await MfaTempToken.findOne({
      where: { token: tempToken, usado: false },
    });
    if (!mfaRecord || mfaRecord.expira_en < new Date()) {
      return res.status(401).json({ success: false, message: 'Token temporal expirado o ya utilizado' });
    }

    const user = await User.scope('full').findByPk(decoded.id, {
      include: [{ model: Role, as: 'roles', attributes: ['id', 'nombre'], through: { attributes: [] } }],
    });

    if (!user || !user.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
    }

    const isValid = mfaUtils.verifyToken(code, user.mfa_secret);
    if (!isValid) {
      await logAction({ usuarioId: user.id, accion: 'MFA_FALLIDO', ip: req.ip, resultado: 'DENEGADO' });
      return res.status(401).json({ success: false, message: 'Código MFA incorrecto' });
    }

    // Marcar token como usado
    await mfaRecord.update({ usado: true });

    const roles = user.roles.map(r => r.nombre);
    const token = jwtUtils.generateToken({
      id      : user.id,
      email   : user.email,
      roles,
      tienda_id: user.tienda_id,
    });

    await user.update({ ultimo_login: new Date() });
    await logAction({ usuarioId: user.id, accion: 'MFA_EXITOSO', ip: req.ip });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id      : user.id,
        nombre  : user.nombre,
        email   : user.email,
        roles,
        tienda_id: user.tienda_id,
        mfa_habilitado: user.mfa_habilitado,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Setup MFA (genera QR) ────────────────────────────────
async function setupMfa(req, res, next) {
  try {
    const user = await User.scope('full').findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { base32, otpauth_url } = mfaUtils.generateSecret(user.email);
    const qrCode = await mfaUtils.generateQRCode(otpauth_url);

    // Guardar el secreto temporalmente (el usuario debe confirmar con un código)
    await user.update({ mfa_secret: base32 });

    return res.status(200).json({
      success: true,
      data   : { qrCode, secret: base32 },
      message: 'Escanea el QR con Google Authenticator y confirma con un código',
    });
  } catch (err) {
    next(err);
  }
}

// ─── Confirmar activación MFA ─────────────────────────────
async function confirmMfa(req, res, next) {
  try {
    const { code } = req.body;
    const user     = await User.scope('full').findByPk(req.userId);

    if (!user?.mfa_secret) {
      return res.status(400).json({ success: false, message: 'Primero configura el MFA' });
    }

    const isValid = mfaUtils.verifyToken(code, user.mfa_secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Código inválido. Intenta de nuevo.' });
    }

    await user.update({ mfa_habilitado: true });
    await logAction({ usuarioId: user.id, accion: 'MFA_ACTIVADO', ip: req.ip });

    return res.status(200).json({ success: true, message: 'MFA activado correctamente' });
  } catch (err) {
    next(err);
  }
}

// ─── Desactivar MFA ───────────────────────────────────────
async function disableMfa(req, res, next) {
  try {
    const { code } = req.body;
    const user     = await User.scope('full').findByPk(req.userId);

    if (!user?.mfa_habilitado) {
      return res.status(400).json({ success: false, message: 'MFA no está habilitado' });
    }

    const isValid = mfaUtils.verifyToken(code, user.mfa_secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Código MFA incorrecto' });
    }

    await user.update({ mfa_habilitado: false, mfa_secret: null });
    await logAction({ usuarioId: user.id, accion: 'MFA_DESACTIVADO', ip: req.ip });

    return res.status(200).json({ success: true, message: 'MFA desactivado correctamente' });
  } catch (err) {
    next(err);
  }
}

// ─── Perfil autenticado ───────────────────────────────────
async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: Role, as: 'roles', attributes: ['id', 'nombre'], through: { attributes: [] } }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, verifyMfa, setupMfa, confirmMfa, disableMfa, getProfile };
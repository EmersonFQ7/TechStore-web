'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  nombre: {
    type     : DataTypes.STRING(100),
    allowNull: false,
    validate : { notEmpty: true },
  },
  email: {
    type     : DataTypes.STRING(150),
    allowNull: false,
    unique   : true,
    validate : { isEmail: true },
  },
  password_hash: {
    type     : DataTypes.STRING(255),
    allowNull: false,
  },
  tienda_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  mfa_habilitado: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: false,
  },
  mfa_secret: {
    type     : DataTypes.STRING(255),
    allowNull: true,
  },
  activo: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: true,
  },
  ultimo_login: {
    type     : DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName  : 'usuarios',
  timestamps : true,
  underscored: true,
  createdAt  : 'creado_en',
  updatedAt  : 'actualizado_en',
  defaultScope: {
    attributes: { exclude: ['password_hash', 'mfa_secret'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password_hash'] },
    },
    withMfa: {
      attributes: { include: ['mfa_secret', 'mfa_habilitado'] },
    },
    full: {
      attributes: {},
    },
  },
});

module.exports = User;
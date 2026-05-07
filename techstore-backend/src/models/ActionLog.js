'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const ActionLog = sequelize.define('ActionLog', {
  id: {
    type         : DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  usuario_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  accion: {
    type     : DataTypes.STRING(100),
    allowNull: false,
  },
  recurso: {
    type     : DataTypes.STRING(100),
    allowNull: true,
  },
  recurso_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  detalle: {
    type     : DataTypes.JSON,
    allowNull: true,
  },
  ip: {
    type     : DataTypes.STRING(45),
    allowNull: true,
  },
  resultado: {
    type        : DataTypes.ENUM('EXITOSO', 'DENEGADO', 'ERROR'),
    allowNull   : false,
    defaultValue: 'EXITOSO',
  },
}, {
  tableName : 'logs_acciones',
  timestamps: true,
  updatedAt : false,
  createdAt : 'creado_en',
  underscored: true,
});

module.exports = ActionLog;
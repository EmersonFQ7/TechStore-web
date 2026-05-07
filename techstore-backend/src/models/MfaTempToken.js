'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const MfaTempToken = sequelize.define('MfaTempToken', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  usuario_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  token: {
    type     : DataTypes.STRING(255),
    allowNull: false,
    unique   : true,
  },
  expira_en: {
    type     : DataTypes.DATE,
    allowNull: false,
  },
  usado: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: false,
  },
}, {
  tableName : 'mfa_temp_tokens',
  timestamps: true,
  updatedAt : false,
  createdAt : 'creado_en',
  underscored: true,
});

module.exports = MfaTempToken;
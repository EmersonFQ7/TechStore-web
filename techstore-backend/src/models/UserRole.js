'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  usuario_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  rol_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  asignado_en: {
    type        : DataTypes.DATE,
    allowNull   : false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName : 'usuario_roles',
  timestamps: false,
});

module.exports = UserRole;
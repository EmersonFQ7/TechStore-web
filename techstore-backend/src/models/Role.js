'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  nombre: {
    type     : DataTypes.STRING(50),
    allowNull: false,
    unique   : true,
    validate : {
      notEmpty: true,
      len     : [2, 50],
    },
  },
  descripcion: {
    type     : DataTypes.STRING(255),
    allowNull: true,
  },
  activo: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: true,
  },
}, {
  tableName  : 'roles',
  timestamps : true,
  underscored: true,
  createdAt  : 'creado_en',
  updatedAt  : 'actualizado_en',
});

module.exports = Role;
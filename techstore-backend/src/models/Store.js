'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  nombre: {
    type     : DataTypes.STRING(100),
    allowNull: false,
    unique   : true,
    validate : { notEmpty: true },
  },
  direccion: {
    type     : DataTypes.STRING(255),
    allowNull: true,
  },
  ciudad: {
    type     : DataTypes.STRING(100),
    allowNull: true,
  },
  activa: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: true,
  },
}, {
  tableName  : 'tiendas',
  timestamps : true,
  underscored: true,
  createdAt  : 'creado_en',
  updatedAt  : 'actualizado_en',
});

module.exports = Store;
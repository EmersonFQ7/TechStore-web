'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type         : DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey   : true,
  },
  nombre: {
    type     : DataTypes.STRING(150),
    allowNull: false,
    validate : { notEmpty: true },
  },
  descripcion: {
    type     : DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type        : DataTypes.DECIMAL(10, 2),
    allowNull   : false,
    defaultValue: 0.00,
    validate    : { min: 0 },
  },
  stock: {
    type        : DataTypes.INTEGER,
    allowNull   : false,
    defaultValue: 0,
    validate    : { min: 0 },
  },
  categoria: {
    type     : DataTypes.STRING(100),
    allowNull: true,
  },
  es_premium: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: false,
  },
  tienda_id: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  creado_por: {
    type     : DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  activo: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: true,
  },
}, {
  tableName  : 'productos',
  timestamps : true,
  underscored: true,
  createdAt  : 'creado_en',
  updatedAt  : 'actualizado_en',
});

module.exports = Product;
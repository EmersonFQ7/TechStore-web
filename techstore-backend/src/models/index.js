'use strict';

const sequelize = require('../config/database');
const Role      = require('./Role');
const User      = require('./User');
const Store     = require('./Store');
const Product   = require('./Product');
const UserRole  = require('./UserRole');
const ActionLog = require('./ActionLog');
const MfaTempToken = require('./MfaTempToken');

// ─── Relaciones ───────────────────────────────────────────

// Usuario ↔ Roles  (N:M a través de UserRole)
User.belongsToMany(Role, {
  through    : UserRole,
  foreignKey : 'usuario_id',
  otherKey   : 'rol_id',
  as         : 'roles',
});
Role.belongsToMany(User, {
  through    : UserRole,
  foreignKey : 'rol_id',
  otherKey   : 'usuario_id',
  as         : 'usuarios',
});

// Usuario → Tienda (N:1)
User.belongsTo(Store, { foreignKey: 'tienda_id', as: 'tienda' });
Store.hasMany(User,   { foreignKey: 'tienda_id', as: 'usuarios' });

// Producto → Tienda (N:1)
Product.belongsTo(Store, { foreignKey: 'tienda_id', as: 'tienda' });
Store.hasMany(Product,   { foreignKey: 'tienda_id', as: 'productos' });

// Producto → Usuario creador (N:1)
Product.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });
User.hasMany(Product,   { foreignKey: 'creado_por', as: 'productosCreados' });

// ActionLog → Usuario (N:1)
ActionLog.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(ActionLog,   { foreignKey: 'usuario_id', as: 'logs' });

// MfaTempToken → Usuario (N:1)
MfaTempToken.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(MfaTempToken,   { foreignKey: 'usuario_id', as: 'mfaTokens' });

module.exports = {
  sequelize,
  Role,
  User,
  Store,
  Product,
  UserRole,
  ActionLog,
  MfaTempToken,
};
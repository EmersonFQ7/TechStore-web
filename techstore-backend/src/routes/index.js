'use strict';

const express      = require('express');
const router       = express.Router();
const authRoutes   = require('./auth.routes');
const userRoutes   = require('./user.routes');
const roleRoutes   = require('./role.routes');
const productRoutes= require('./product.routes');
const storeRoutes  = require('./store.routes');

router.use('/auth',     authRoutes);
router.use('/users',    userRoutes);
router.use('/roles',    roleRoutes);
router.use('/products', productRoutes);
router.use('/stores',   storeRoutes);

module.exports = router;
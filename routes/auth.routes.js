const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route POST /api/auth/register
router.post('/register', authController.register);

// @route POST /api/auth/login
router.post('/login', authController.login);

// @route GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

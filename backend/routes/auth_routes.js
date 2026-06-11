const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');

/**
 * Authentication Routes for Wantok Workforce
 */

// POST /api/auth/signup
router.post('/signup', AuthController.signup);

// POST /api/auth/login
router.post('/login', AuthController.login);

module.exports = router;

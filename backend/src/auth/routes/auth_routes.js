const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');

/**
 * Authentication Domain Routes
 */

// POST /api/auth/register -> Creates a new secure user account
router.post('/register', AuthController.register);

// POST /api/auth/login -> Issues JWT for valid credentials
router.post('/login', AuthController.login);

module.exports = router;

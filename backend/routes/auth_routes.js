const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Authentication & Role Management Routes for Wantok Workforce
 */

// POST /api/auth/signup -> Creates central account
router.post('/signup', AuthController.signup);

// POST /api/auth/signin -> Validates credentials
router.post('/signin', AuthController.login);

// POST /api/auth/select-role -> Initial role selection right after signup
router.post('/select-role', authMiddleware, AuthController.selectRole);

// PATCH /api/auth/switch-persona -> Fluid context shifting between roles
router.patch('/switch-persona', authMiddleware, AuthController.switchPersona);

module.exports = router;

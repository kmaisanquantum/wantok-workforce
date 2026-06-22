const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');
const { authMiddleware } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rate_limit');

router.post('/register', AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/admin-login', loginLimiter, AuthController.login);

// Persona Management
router.post('/select-role', authMiddleware, AuthController.selectRole);
router.patch('/switch-persona', authMiddleware, AuthController.switchPersona);

// Profile
router.patch('/profile', authMiddleware, AuthController.updateProfile);

// Availability
router.patch('/availability', authMiddleware, AuthController.toggleAvailability);

module.exports = router;

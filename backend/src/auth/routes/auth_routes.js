const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');
const { authMiddleware } = require('../middlewares/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Persona Management
router.post('/select-role', authMiddleware, AuthController.selectRole);
router.patch('/switch-persona', authMiddleware, AuthController.switchPersona);

// Profile
router.patch('/profile', authMiddleware, AuthController.updateProfile);

// Availability
router.patch('/availability', authMiddleware, AuthController.toggleAvailability);

module.exports = router;

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth_controller');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Authentication & Identity Routes
 */

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// PATCH /api/auth/availability -> Toggles provider work status
router.patch('/availability', authMiddleware, AuthController.toggleAvailability);

module.exports = router;

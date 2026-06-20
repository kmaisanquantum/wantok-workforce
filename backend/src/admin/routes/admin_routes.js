const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin_controller');
const { authMiddleware, roleCheckMiddleware } = require('../../auth/middlewares/auth');

// All admin routes require admin role
router.use(authMiddleware);
router.use(roleCheckMiddleware(['admin']));

router.get('/stats', AdminController.getStats);
router.get('/pending-providers', AdminController.getPendingProviders);
router.post('/approve/:providerId', AdminController.approveProvider);
router.post('/flag/:userId', AdminController.flagUser);

// User Management CRUD
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:userId', AdminController.updateUser);
router.delete('/users/:userId', AdminController.deleteUser);

// System Logs
router.get('/logs', AdminController.getSystemLogs);

module.exports = router;

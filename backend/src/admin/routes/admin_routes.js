const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin_controller');
const { authMiddleware, roleCheckMiddleware } = require('../../auth/middlewares/auth');

// All admin routes are protected
router.use(authMiddleware);
router.use(roleCheckMiddleware(['admin']));

// GET /api/admin/stats -> Real-time dashboard metrics
router.get('/stats', AdminController.getStats);
router.get('/dashboard-metrics', AdminController.getDashboardMetrics);
router.get('/dashboard-stats', AdminController.getStats);

// GET /api/admin/pending-providers -> Queue of providers awaiting verification
router.get('/pending-providers', AdminController.getPendingProviders);

// PATCH /api/admin/approve-provider/:providerId -> Verify a trade professional
router.patch('/approve-provider/:providerId', AdminController.approveProvider);

// User Management (CRUD)
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.patch('/users/:userId', AdminController.updateUser);
router.delete('/users/:userId', AdminController.deleteUser);

// Queue Management
router.get('/queue', AdminController.getQueue);
router.post('/queue/override', AdminController.overrideQueue);

// System Settings
router.get('/settings', AdminController.getSettings);
router.post('/settings', AdminController.updateSettings);

// Match Engine Config
router.post('/match-config', AdminController.updateMatchConfig);

// PATCH /api/admin/flag-user/:userId -> Moderation action
router.patch('/flag-user/:userId', AdminController.flagUser);

// GET /api/admin/logs -> System event logs
router.get('/logs', AdminController.getSystemLogs);
router.get('/system-logs', AdminController.getSystemLogs);

module.exports = router;

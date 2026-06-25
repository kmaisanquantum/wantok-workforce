const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin_controller');
const { authMiddleware, roleCheckMiddleware } = require('../../auth/middlewares/auth');

/**
 * Production-ready Admin Routes
 * Implements self-healing metrics and secure role-based access
 */

// Diagnostic / Dashboard Metrics (Protected by Auth but optimized for speed)
const adminAuth = [authMiddleware, roleCheckMiddleware(["admin"])];
// These endpoints use the self-healing Redis-to-PostgreSQL fallback
router.get('/dashboard-metrics', ...adminAuth, AdminController.getDashboardMetrics);
router.get('/stats', ...adminAuth, AdminController.getStats);
router.get('/system-logs', ...adminAuth, AdminController.getSystemLogs);

// Management Routes (Strictly Admin Persona only)

router.get('/users', ...adminAuth, AdminController.getAllUsers);
router.post('/users/force-sync', ...adminAuth, AdminController.forceSyncUsers);
router.post('/users', ...adminAuth, AdminController.createUser);
router.put('/users/:userId', ...adminAuth, AdminController.updateUser);
router.delete('/users/:userId', ...adminAuth, AdminController.deleteUser);

router.get('/pending-providers', ...adminAuth, AdminController.getPendingProviders);
router.post('/providers/:providerId/approve', ...adminAuth, AdminController.approveProvider);
router.post('/users/:userId/flag', ...adminAuth, AdminController.flagUser);

router.get('/queue', ...adminAuth, AdminController.getQueue);
router.post('/queue/override', ...adminAuth, AdminController.overrideQueue);

router.get('/settings', ...adminAuth, AdminController.getSettings);
router.post('/settings', ...adminAuth, AdminController.updateSettings);
router.post('/match-config', ...adminAuth, AdminController.updateMatchConfig);

module.exports = router;

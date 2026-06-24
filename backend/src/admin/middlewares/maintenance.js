const AdminController = require('../controllers/admin_controller');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const isMaintenance = await AdminController.getInternalSetting('maintenance_mode', false);

    // Check if value is string 'true' or boolean true
    if (isMaintenance === true || isMaintenance === 'true') {
      // Security Bypass: Always allow login and registration even in maintenance mode per user request
      const allowedPaths = ['/admin-login', '/login', '/register'];
      if (allowedPaths.some(path => req.path.includes(path))) {
         console.log(`🛡️ Maintenance Bypass allowed for path: ${req.path}`);
         return next();
      }

      return res.status(503).json({
        error: 'System Maintenance',
        message: 'The system is currently undergoing maintenance. Please try again later.'
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance Check Error:', error);
    next();
  }
};

module.exports = maintenanceMiddleware;

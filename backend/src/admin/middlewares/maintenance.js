const AdminController = require('../controllers/admin_controller');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const isMaintenance = await AdminController.getInternalSetting('maintenance_mode', false);

    // Check if value is string 'true' or boolean true
    if (isMaintenance === true || isMaintenance === 'true') {
      // Allow admin login even in maintenance mode?
      // Usually yes, so the admin can fix things.
      if (req.path === '/admin-login' || req.path === '/login') {
         // We might want to check the email if possible, but at this stage we don't know who is logging in yet.
         // Let's allow login attempts but block registration.
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

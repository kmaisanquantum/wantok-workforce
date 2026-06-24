const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');
const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Forbidden: Account is suspended' });
    }

    // User Request: Remove blocking for pending_verification to ensure service providers can sign up and proceed.
    // We will still log it for auditing purposes.
    if (user.status === 'pending_verification') {
      console.log(`ℹ️ User ${user.email} is accessing system while pending_verification.`);
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const roleCheckMiddleware = (allowedPersonas) => {
  return (req, res, next) => {
    if (!req.user || !req.user.active_persona) {
      return res.status(403).json({ error: 'Forbidden: No active persona set' });
    }

    if (!allowedPersonas.includes(req.user.active_persona)) {
      return res.status(403).json({
        error: `Forbidden: Access denied for active persona '${req.user.active_persona}'`
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleCheckMiddleware };

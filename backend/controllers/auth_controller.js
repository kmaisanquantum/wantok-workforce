const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

class AuthController {
  static async signup(req, res) {
    console.log('📥 Signup request received:', { ...req.body, password: '****' });
    try {
      const { name, phone, email, password } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      console.log('🔐 Hashing password...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      console.log('🗄️ Creating user in database...');
      const user = await UserModel.create({ name, phone, email, passwordHash });

      console.log('🎟️ Generating JWT...');
      const token = jwt.sign({ id: user.id, role: user.active_persona }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Signup successful for:', email);
      return res.status(201).json({
        message: 'Account created. Please select your initial role.',
        token,
        user: { id: user.id, name: user.name, email: user.email, persona: null }
      });
    } catch (error) {
      console.error('❌ Signup Error:', error);

      let errorMessage = 'Internal server error during signup';
      if (error.code === '23505') {
        errorMessage = 'Email or phone number already registered';
        return res.status(409).json({ error: errorMessage });
      }

      const detailedError = `DB Error (${error.code || 'No Code'}): ${error.message}`;
      return res.status(500).json({
        error: errorMessage,
        details: detailedError
      });
    }
  }

  static async login(req, res) {
    console.log('📥 Login attempt:', req.body.identifier);
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      console.log('🗄️ Finding user...');
      const user = await UserModel.findByIdentifier(identifier);
      if (!user) {
        console.log('👤 User not found');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('🔐 Comparing passwords...');
      if (!(await bcrypt.compare(password, user.password_hash))) {
        console.log('🔑 Password mismatch');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, role: user.active_persona }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Login successful:', user.email);
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          active_persona: user.active_persona,
          roles: user.roles
        }
      });
    } catch (error) {
      console.error('❌ Login Error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  static async selectRole(req, res) {
    try {
      const { role } = req.body;

      if (!['customer', 'provider'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selection' });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User context missing' });
      }

      const userId = req.user.id;
      await UserModel.addRole(userId, role);
      const updated = await UserModel.updateActivePersona(userId, role);

      return res.status(200).json({
        message: `Role '${role}' selected successfully`,
        active_persona: updated.active_persona
      });
    } catch (error) {
      console.error('❌ selectRole Error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  static async switchPersona(req, res) {
    try {
      const { new_persona } = req.body;
      const user = req.user;

      if (!user || !user.roles || !user.roles.includes(new_persona)) {
        return res.status(403).json({ error: 'Forbidden: You do not have this role capability' });
      }

      const updated = await UserModel.updateActivePersona(user.id, new_persona);

      return res.status(200).json({
        message: `Switched to ${new_persona} mode`,
        active_persona: updated.active_persona
      });
    } catch (error) {
      console.error('❌ switchPersona Error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}

module.exports = AuthController;

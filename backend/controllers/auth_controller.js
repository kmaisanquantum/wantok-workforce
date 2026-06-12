const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

class AuthController {
  static async signup(req, res) {
    try {
      const { name, phone, email, password } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await UserModel.create({ name, phone, email, passwordHash });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Account created. Please select your initial role.',
        token,
        user: { id: user.id, name: user.name, email: user.email, persona: null }
      });
    } catch (error) {
      console.error('Signup Error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email or phone number already registered' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req, res) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      const user = await UserModel.findByIdentifier(identifier);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

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
      console.error('Login Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async selectRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.user.id;

      if (!['customer', 'provider'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selection' });
      }

      await UserModel.addRole(userId, role);
      const updated = await UserModel.updateActivePersona(userId, role);

      return res.status(200).json({
        message: `Role '${role}' selected successfully`,
        active_persona: updated.active_persona
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async switchPersona(req, res) {
    try {
      const { new_persona } = req.body;
      const user = req.user;

      if (!user.roles.includes(new_persona)) {
        return res.status(403).json({ error: 'Forbidden: You do not have this role capability' });
      }

      const updated = await UserModel.updateActivePersona(user.id, new_persona);

      return res.status(200).json({
        message: `Switched to ${new_persona} mode`,
        active_persona: updated.active_persona
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;

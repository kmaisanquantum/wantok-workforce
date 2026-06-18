const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

class AuthController {
  static async register(req, res) {
    console.log('📥 Registration request received:', { ...req.body, password: '****' });
    try {
      const { name, phone, email, password, role } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userRole = role || 'customer';
      if (!['customer', 'provider'].includes(userRole)) {
        return res.status(400).json({ error: 'Invalid role selection' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      console.log('🔐 Hashing password...');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      console.log('🗄️ Saving user to database...');
      const user = await UserModel.create({
        name,
        phone,
        email,
        passwordHash,
        role: userRole
      });

      console.log('🎟️ Issuing JWT session...');
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Registration successful for:', email, 'Role:', userRole);
      return res.status(201).json({
        message: 'Account registered successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roles: [user.role],
          is_available: user.is_available
        }
      });
    } catch (error) {
      console.error('❌ Registration Error:', error);
      if (error.code === '23505') return res.status(409).json({ error: 'Email or phone number already registered' });
      return res.status(500).json({ error: 'Internal server error during registration', details: error.message });
    }
  }

  static async login(req, res) {
    console.log('📥 Login attempt:', req.body.identifier);
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      const user = await UserModel.findByIdentifier(identifier);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      console.log('🔐 Verifying credentials...');
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.active_persona }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Login successful:', user.email);
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone_number,
          role: user.role,
          active_persona: user.active_persona,
          roles: user.roles,
          is_available: user.is_available
        }
      });
    } catch (error) {
      console.error('❌ Login Error:', error);
      return res.status(500).json({ error: 'Internal server error during login' });
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
      await UserModel.updateActivePersona(userId, role);

      return res.status(200).json({ message: 'Role selected successfully', active_persona: role });
    } catch (error) {
      console.error('❌ Select Role Error:', error);
      return res.status(500).json({ error: 'Internal server error during role selection' });
    }
  }

  static async switchPersona(req, res) {
    try {
      const { role } = req.body;
      const userId = req.user.id;

      if (!['customer', 'provider'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selection' });
      }

      // Verify user actually has this role
      if (!req.user.roles.includes(role)) {
        return res.status(403).json({ error: 'User does not have this role' });
      }

      await UserModel.updateActivePersona(userId, role);

      return res.status(200).json({ message: 'Persona switched successfully', active_persona: role });
    } catch (error) {
      console.error('❌ Switch Persona Error:', error);
      return res.status(500).json({ error: 'Internal server error during persona switch' });
    }
  }

  static async toggleAvailability(req, res) {
    try {
      const { is_available } = req.body;
      const userId = req.user.id;

      if (typeof is_available !== 'boolean') {
        return res.status(400).json({ error: 'is_available must be a boolean' });
      }

      const result = await UserModel.updateAvailability(userId, is_available);

      return res.status(200).json({
        message: 'Availability updated successfully',
        is_available: result.is_available
      });
    } catch (error) {
      console.error('❌ Toggle Availability Error:', error);
      return res.status(500).json({ error: 'Internal server error during availability update' });
    }
  }
}

module.exports = AuthController;

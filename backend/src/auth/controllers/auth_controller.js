const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

class AuthController {
  static async register(req, res) {
    console.log('📥 Registration request received:', { ...req.body, password: '****' });
    try {
      const { name, phone, email, password } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      console.log('🔐 Hashing password...');
      const saltRounds = 12; // Increased security
      const passwordHash = await bcrypt.hash(password, saltRounds);

      console.log('🗄️ Saving user to database...');
      const user = await UserModel.create({ name, phone, email, passwordHash });

      console.log('🎟️ Issuing JWT session...');
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Registration successful for:', email);
      return res.status(201).json({
        message: 'Account registered successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      console.error('❌ Registration Error:', error);

      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email or phone number already registered' });
      }

      return res.status(500).json({ error: 'Internal server error during registration' });
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
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('🔐 Verifying credentials...');
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

      console.log('✅ Login successful:', user.email);
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          active_persona: user.active_persona
        }
      });
    } catch (error) {
      console.error('❌ Login Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;

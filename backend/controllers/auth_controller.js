const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

class AuthController {
  /**
   * POST /api/auth/signup
   * Handles role-based registration logic
   */
  static async signup(req, res) {
    try {
      const { name, phone, email, password, role, location, primarySkill } = req.body;

      // 1. Basic validation
      if (!name || !phone || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // 2. Role-specific validation
      if (role === 'customer' && !location) {
        return res.status(400).json({ error: 'Location is required for customer signup' });
      }
      if (role === 'provider' && !primarySkill) {
        return res.status(400).json({ error: 'Primary skill is required for provider signup' });
      }

      // 3. Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 4. Create user in DB
      const user = await UserModel.create({
        name,
        phone,
        email,
        passwordHash,
        role,
        locationName: location,
        primarySkill
      });

      // 5. Generate JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user
      });
    } catch (error) {
      console.error('Signup Error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email or phone number already registered' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/login
   * Validates credentials and returns JWT + metadata
   */
  static async login(req, res) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      // 1. Find user
      const user = await UserModel.findByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 3. Generate JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      // 4. Return user metadata (exclude hash)
      const { password_hash, ...userMetadata } = user;

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: userMetadata.id,
          name: userMetadata.name,
          email: userMetadata.email,
          phone: userMetadata.phone_number,
          role: userMetadata.role,
          location: userMetadata.location_name,
          primarySkill: userMetadata.primary_skill
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;

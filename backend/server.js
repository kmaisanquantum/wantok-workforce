const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth_routes');
const UserModel = require('./models/user_model');
const { initializeDatabase } = require('./db/db_init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Wantok API is healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Database Health Check
app.get('/api/health/db', async (req, res) => {
  try {
    const isConnected = await UserModel.checkConnection();
    if (isConnected) {
      res.status(200).json({ status: 'Database connected', timestamp: new Date().toISOString() });
    } else {
      res.status(503).json({ status: 'Database disconnected', timestamp: new Date().toISOString() });
    }
  } catch (err) {
    res.status(500).json({
      status: 'Database error',
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve Static Frontend Assets
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to Index.html for SPA (must be after other routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize server
app.listen(PORT, async () => {
  console.log(`Wantok Unified Server running on port ${PORT}`);

  // DB Connectivity & Schema Sync
  try {
    const pool = require('./models/user_model').pool;
    await initializeDatabase(pool);
    console.log('✅ Backend is ready and database is synced.');
  } catch (err) {
    console.error('❌ CRITICAL ERROR during startup:');
    console.error('Database connection failed details:', err);

    if (err.code === 'ECONNREFUSED') {
      console.error('💡 Recommendation: Check if the database server is running and accessible.');
    } else if (err.code === '28P01' || err.code === '28000') {
      console.error('💡 Recommendation: Check your DATABASE_URL credentials.');
    } else if (err.code === '3D000') {
      console.error('💡 Recommendation: Check if the database name exists.');
    }
  }
});

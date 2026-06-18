const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/auth/routes/auth_routes');
const UserModel = require('./src/auth/models/user_model');
const { initializeDatabase } = require('./db/db_init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Domain API Routes
app.use('/api/auth', authRoutes);

// Health Checks
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Wantok API is healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const isConnected = await UserModel.checkConnection();
    if (isConnected) {
      res.status(200).json({ status: 'Database connected' });
    } else {
      res.status(503).json({ status: 'Database disconnected' });
    }
  } catch (err) {
    res.status(500).json({ status: 'Database error', error: err.message });
  }
});

// Serve Static Frontend Assets (Production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize server
app.listen(PORT, async () => {
  console.log(`Wantok Unified Server running on port ${PORT}`);

  try {
    const pool = UserModel.getPool();
    await initializeDatabase(pool);
    console.log('✅ Backend is ready and database is synced.');
  } catch (err) {
    console.error('❌ CRITICAL ERROR during startup:', err.message);
  }
});

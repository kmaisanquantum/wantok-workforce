const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');
const UserModel = require('./models/user_model');
const { initializeDatabase } = require('./db/db_init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Wantok API is healthy', timestamp: new Date().toISOString() });
});

// Root Redirect
app.get('/', (req, res) => {
  res.redirect('https://wantok.dspng.tech');
});

// Initialize server
app.listen(PORT, async () => {
  console.log(`Wantok Backend running on port ${PORT}`);

  // DB Connectivity & Schema Sync
  try {
    console.log('🔗 Connecting to database...');
    const pool = require('./models/user_model').pool; // Access pool for init
    await initializeDatabase(pool);
    console.log('✅ Backend is ready to serve requests.');
  } catch (err) {
    console.error('❌ CRITICAL ERROR during startup:');
    console.error('Type:', err.name);
    console.error('Message:', err.message);
    console.error('Stack Trace:', err.stack);

    if (err.code === 'ECONNREFUSED') {
      console.error('💡 Recommendation: Check if the database server is running and accessible from this container.');
    } else if (err.code === '28P01' || err.code === '28000') {
      console.error('💡 Recommendation: Check your DATABASE_URL credentials (user/password).');
    } else if (err.code === '3D000') {
      console.error('💡 Recommendation: Check if the database name in your connection string exists.');
    }
  }

  console.log(`Accepting requests at http://localhost:${PORT}/api/auth`);
});

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');
const UserModel = require('./models/user_model');

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

  // DB Connectivity Check
  try {
    await UserModel.checkConnection();
    console.log('✅ Database connection established successfully.');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }

  console.log(`Accepting requests at http://localhost:${PORT}/api/auth`);
});

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
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
app.listen(PORT, () => {
  console.log(`Wantok Backend running on port ${PORT}`);
  console.log(`Accepting requests at http://localhost:${PORT}/api/auth`);
});

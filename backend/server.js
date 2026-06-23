const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');

const authRoutes = require('./src/auth/routes/auth_routes');
const matchRoutes = require('./src/match/routes/match_routes');
const adminRoutes = require('./src/admin/routes/admin_routes');
const UserModel = require('./src/auth/models/user_model');
const { initializeDatabase } = require('./db/db_init');
const redisClient = require('./db/redis_init');

const JWT_SECRET = process.env.JWT_SECRET || 'wantok-development-secret-2024';

const app = express();
app.set("trust proxy", 1);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// Configure Redis adapter for Socket.io if Redis is available
if (redisClient) {
  const pubClient = redisClient;
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Dedicated subscriber for job_alerts
  const jobSubscriber = pubClient.duplicate();
  jobSubscriber.subscribe('job_alerts');
  jobSubscriber.on('message', (channel, message) => {
    if (channel === 'job_alerts') {
      try {
        const payload = JSON.parse(message);
        console.log(`📢 Redis Pub/Sub: Job alert for trade ${payload.trade_category}`);
        // Broadcast to specific trade room
        io.to(payload.trade_category).emit('new_job_alert', payload);
      } catch (e) {
        console.error('❌ Error parsing Pub/Sub message:', e.message);
      }
    }
  });
}

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) return next(new Error('Authentication error: No token provided'));

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) return next(new Error('Authentication error: User not found'));

    // Security Check: Block suspended or pending verification users from socket real-time stream
    if (user.status === 'suspended' || user.status === 'pending_verification') {
      console.warn(`🚫 Socket connection rejected for ${user.email} (Status: ${user.status})`);
      return next(new Error(`Access denied: Account ${user.status}`));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io Connection Handling & Room Management
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id, 'User:', socket.user?.email);

  socket.on('join_trade_room', (trade) => {
    if (trade) {
      socket.join(trade);
      console.log(`👤 Socket ${socket.id} joined room: ${trade}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["http://wantok.dspng.tech", "https://wantok.dspng.tech", "https://wantok-workforce.onrender.com", "http://localhost:3000", "http://localhost:19006", "http://localhost:8081"];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/admin', adminRoutes);

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
httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`Wantok Unified Server running on port ${PORT}`);

  try {
    const pool = UserModel.getPool();
    if (pool) {
      await initializeDatabase(pool);
      console.log('✅ Backend is ready and database is synced.');
    } else {
      console.warn('⚠️ Database pool not initialized. Migration bypassed.');
    }
  } catch (err) {
    console.error('❌ Migration error bypassed for safety:', err.message);
  }
});

module.exports = { app, io };

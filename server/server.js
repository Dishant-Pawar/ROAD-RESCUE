import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Global Socket.io instance reference for routes
let io;
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api', userRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'RoadRescue Premium API is online.' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 RoadRescue Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Initialize socket.io server
io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
// Nodemon trigger comment: loaded new OAuth credentials



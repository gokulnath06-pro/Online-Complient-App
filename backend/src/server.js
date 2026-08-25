import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';

// Load environment variables
dotenv.config();

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './utils/seeder.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static folder for uploaded files
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Attach Socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ResolveX Complaint System API is online and operational',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

  // Join a ticket conversation room
  socket.on('join_ticket', (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`👥 Socket ${socket.id} joined room: ticket_${ticketId}`);
  });

  // Leave a ticket conversation room
  socket.on('leave_ticket', (ticketId) => {
    socket.leave(`ticket_${ticketId}`);
    console.log(`👋 Socket ${socket.id} left room: ticket_${ticketId}`);
  });

  // User/Agent typing indicator
  socket.on('typing', ({ ticketId, user, isTyping }) => {
    socket.to(`ticket_${ticketId}`).emit('user_typing', { user, isTyping });
  });

  // Real-time new message broadcast
  socket.on('send_chat_message', (data) => {
    io.to(`ticket_${data.complaintId}`).emit('receive_chat_message', data);
  });

  // Complaint status change broadcast
  socket.on('complaint_status_changed', (data) => {
    io.emit('ticket_updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and connect database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed database if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Auto-seeding initial demo data...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`
🚀 ====================================================
✨ ResolveX Complaint Management API Server Running!
📡 Port: ${PORT}
🌐 Base URL: http://localhost:${PORT}
⚡ Socket.io: Enabled
📁 Uploads: http://localhost:${PORT}/uploads
🔐 Roles: USER, AGENT, ADMIN
====================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();

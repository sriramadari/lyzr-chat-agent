import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import agentRoutes from './routes/agents';
import chatRoutes from './routes/chat';
import widgetRoutes from './routes/widget';
import ticketRoutes from './routes/tickets';
import userRoutes from './routes/users';

// Import utilities
import { getDemoHTML } from './utils/demoTemplate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP completely for widget embedding
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://lyzr-chat-agent.vercel.app',
    '*' // Allow all origins for widget embedding
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/static', express.static(path.join(process.cwd(), 'public')));
app.use('/widget', express.static(path.join(process.cwd(), 'widget')));

// Demo page route
app.get('/demo.html', (req, res) => {
  const demoHTML = getDemoHTML(req.protocol, req.get('host') || 'localhost:8080');
  res.setHeader('Content-Type', 'text/html');
  res.send(demoHTML);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
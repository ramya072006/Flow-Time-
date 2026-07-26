import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { config } from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { setupSockets } from './sockets';
import { setupCronJobs } from './cron/schedulingJobs';

// Routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import calendarRoutes from './routes/calendar';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import workspaceRoutes from './routes/workspaces';

const app = express();
const httpServer = http.createServer(app);

// Security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Allow configured client URL (set CLIENT_URL on Render to your Netlify domain)
    if (config.clientUrl && origin === config.clientUrl) {
      return callback(null, true);
    }
    // Allow any Netlify subdomain as fallback
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    // Allow any Render subdomain (for internal requests)
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting disabled for now
// Re-enable before going to production

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workspaces', workspaceRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Setup Socket.io
const io = setupSockets(httpServer);
app.set('io', io);

// Start server
const start = async () => {
  await connectDatabase();
  setupCronJobs();

  httpServer.listen(config.port, () => {
    logger.info(`🚀 FlowTime server running on port ${config.port}`);
    logger.info(`📡 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 Client URL: ${config.clientUrl}`);
  });
};

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { app, io };

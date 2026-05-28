import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { config } from '../config';

export const setupSockets = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:') || origin === config.clientUrl) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join workspace rooms
    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      logger.debug(`User ${userId} joined workspace ${workspaceId}`);
    });

    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // Presence
    socket.on('presence:update', (status: string) => {
      socket.broadcast.to(`user:${userId}`).emit('presence:changed', { userId, status });
    });

    // Typing indicators
    socket.on('typing:start', (data: { workspaceId: string; taskId: string }) => {
      socket.to(`workspace:${data.workspaceId}`).emit('typing:started', {
        userId,
        taskId: data.taskId,
      });
    });

    socket.on('typing:stop', (data: { workspaceId: string; taskId: string }) => {
      socket.to(`workspace:${data.workspaceId}`).emit('typing:stopped', {
        userId,
        taskId: data.taskId,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper to emit to a user
export const emitToUser = (io: SocketServer, userId: string, event: string, data: unknown) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper to emit to a workspace
export const emitToWorkspace = (io: SocketServer, workspaceId: string, event: string, data: unknown) => {
  io.to(`workspace:${workspaceId}`).emit(event, data);
};

import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './socket-auth';
import { 
  handlePresence,
  handleCollaboration,
  handleAnalytics,
  handleActivity,
  handleTyping
} from './handlers';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userName})`);

    // Emit initial connection success
    socket.emit('connected', {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
    });

    // Join survey-specific rooms
    socket.on('join:survey', async (surveyId: string) => {
      if (!surveyId) return;
      
      const room = `survey:${surveyId}`;
      await socket.join(room);
      
      // Notify others in the room
      socket.to(room).emit('user:joined', {
        userId: socket.userId,
        userName: socket.userName,
        surveyId,
        timestamp: new Date().toISOString(),
      });

      // Send current room participants
      const sockets = await io.in(room).fetchSockets();
      const participants = sockets.map((s: any) => ({
        userId: s.userId,
        userName: s.userName,
        socketId: s.id,
      }));
      
      socket.emit('room:participants', {
        surveyId,
        participants,
      });
    });

    // Leave survey room
    socket.on('leave:survey', async (surveyId: string) => {
      if (!surveyId) return;
      
      const room = `survey:${surveyId}`;
      await socket.leave(room);
      
      socket.to(room).emit('user:left', {
        userId: socket.userId,
        userName: socket.userName,
        surveyId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle presence updates
    handlePresence(io, socket);

    // Handle collaborative editing
    handleCollaboration(io, socket);

    // Handle real-time analytics
    handleAnalytics(io, socket);

    // Handle activity feed
    handleActivity(io, socket);

    // Handle typing indicators
    handleTyping(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.userName})`);
      
      // Notify all rooms the user was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit('user:disconnected', {
            userId: socket.userId,
            userName: socket.userName,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic health check
  setInterval(() => {
    io.emit('ping', Date.now());
  }, 30000);
}
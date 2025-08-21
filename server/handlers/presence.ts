import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket-auth';

interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

interface PresenceUpdate {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy';
  currentPage?: string;
  cursor?: CursorPosition;
  timestamp: string;
}

export function handlePresence(io: Server, socket: AuthenticatedSocket) {
  // Update presence status
  socket.on('presence:update', (data: Partial<PresenceUpdate>) => {
    const update: PresenceUpdate = {
      userId: socket.userId!,
      userName: socket.userName!,
      status: data.status || 'online',
      currentPage: data.currentPage,
      cursor: data.cursor,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected users
    socket.broadcast.emit('presence:updated', update);
  });

  // Cursor position updates (throttled on client)
  socket.on('cursor:move', (data: { surveyId: string; position: CursorPosition }) => {
    const room = `survey:${data.surveyId}`;
    
    socket.to(room).emit('cursor:moved', {
      userId: socket.userId,
      userName: socket.userName,
      position: data.position,
      timestamp: new Date().toISOString(),
    });
  });

  // Focus/blur events for form fields
  socket.on('field:focus', (data: { surveyId: string; fieldId: string }) => {
    const room = `survey:${data.surveyId}`;
    
    socket.to(room).emit('field:focused', {
      userId: socket.userId,
      userName: socket.userName,
      fieldId: data.fieldId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('field:blur', (data: { surveyId: string; fieldId: string }) => {
    const room = `survey:${data.surveyId}`;
    
    socket.to(room).emit('field:blurred', {
      userId: socket.userId,
      userName: socket.userName,
      fieldId: data.fieldId,
      timestamp: new Date().toISOString(),
    });
  });

  // User status changes
  socket.on('status:away', () => {
    socket.broadcast.emit('user:status', {
      userId: socket.userId,
      userName: socket.userName,
      status: 'away',
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('status:back', () => {
    socket.broadcast.emit('user:status', {
      userId: socket.userId,
      userName: socket.userName,
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  });
}
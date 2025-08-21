import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket-auth';

interface TypingEvent {
  surveyId: string;
  fieldId: string;
  isTyping: boolean;
}

// Store typing timeouts to auto-clear typing indicators
const typingTimeouts = new Map<string, NodeJS.Timeout>();

export function handleTyping(io: Server, socket: AuthenticatedSocket) {
  // Handle typing start
  socket.on('typing:start', (data: Omit<TypingEvent, 'isTyping'>) => {
    const room = `survey:${data.surveyId}`;
    const typingKey = `${socket.userId}:${data.fieldId}`;

    // Clear existing timeout if any
    const existingTimeout = typingTimeouts.get(typingKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Broadcast typing indicator
    socket.to(room).emit('typing:indicator', {
      userId: socket.userId,
      userName: socket.userName,
      fieldId: data.fieldId,
      isTyping: true,
      timestamp: new Date().toISOString(),
    });

    // Auto-clear typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      socket.to(room).emit('typing:indicator', {
        userId: socket.userId,
        userName: socket.userName,
        fieldId: data.fieldId,
        isTyping: false,
        timestamp: new Date().toISOString(),
      });
      typingTimeouts.delete(typingKey);
    }, 3000);

    typingTimeouts.set(typingKey, timeout);
  });

  // Handle typing stop
  socket.on('typing:stop', (data: Omit<TypingEvent, 'isTyping'>) => {
    const room = `survey:${data.surveyId}`;
    const typingKey = `${socket.userId}:${data.fieldId}`;

    // Clear timeout
    const timeout = typingTimeouts.get(typingKey);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeouts.delete(typingKey);
    }

    // Broadcast typing stopped
    socket.to(room).emit('typing:indicator', {
      userId: socket.userId,
      userName: socket.userName,
      fieldId: data.fieldId,
      isTyping: false,
      timestamp: new Date().toISOString(),
    });
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    // Clear all typing timeouts for this user
    typingTimeouts.forEach((timeout, key) => {
      if (key.startsWith(`${socket.userId}:`)) {
        clearTimeout(timeout);
        typingTimeouts.delete(key);
      }
    });
  });
}
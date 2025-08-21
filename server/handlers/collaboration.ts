import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket-auth';

interface SurveyUpdate {
  surveyId: string;
  questionId?: string;
  field: string;
  value: any;
  version: number;
  operation?: 'insert' | 'update' | 'delete';
}

interface ConflictResolution {
  surveyId: string;
  conflictId: string;
  resolution: 'accept' | 'reject' | 'merge';
  mergedValue?: any;
}

export function handleCollaboration(io: Server, socket: AuthenticatedSocket) {
  // Handle survey content updates
  socket.on('survey:update', async (data: SurveyUpdate) => {
    const room = `survey:${data.surveyId}`;
    
    // Validate and sanitize the update
    const update = {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to other users in the room
    socket.to(room).emit('survey:updated', update);

    // Send acknowledgment back to sender
    socket.emit('survey:update:ack', {
      ...update,
      success: true,
    });

    // Log activity
    io.emit('activity:new', {
      type: 'survey_update',
      userId: socket.userId,
      userName: socket.userName,
      surveyId: data.surveyId,
      details: `Updated ${data.field}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle question reordering
  socket.on('questions:reorder', (data: { 
    surveyId: string; 
    questionIds: string[];
    version: number;
  }) => {
    const room = `survey:${data.surveyId}`;
    
    const update = {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString(),
    };

    socket.to(room).emit('questions:reordered', update);
    
    socket.emit('questions:reorder:ack', {
      ...update,
      success: true,
    });
  });

  // Handle collaborative lock requests
  socket.on('field:lock', (data: { surveyId: string; fieldId: string }) => {
    const room = `survey:${data.surveyId}`;
    
    socket.to(room).emit('field:locked', {
      fieldId: data.fieldId,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('field:unlock', (data: { surveyId: string; fieldId: string }) => {
    const room = `survey:${data.surveyId}`;
    
    socket.to(room).emit('field:unlocked', {
      fieldId: data.fieldId,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle conflict resolution
  socket.on('conflict:resolve', (data: ConflictResolution) => {
    const room = `survey:${data.surveyId}`;
    
    io.to(room).emit('conflict:resolved', {
      ...data,
      resolvedBy: socket.userId,
      resolvedByName: socket.userName,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle optimistic updates
  socket.on('optimistic:update', (data: {
    surveyId: string;
    updateId: string;
    changes: any;
  }) => {
    const room = `survey:${data.surveyId}`;
    
    // Store optimistic update for potential rollback
    socket.emit('optimistic:update:tracking', {
      updateId: data.updateId,
      timestamp: new Date().toISOString(),
    });

    // Broadcast to others
    socket.to(room).emit('optimistic:update:received', {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  // Handle rollback requests
  socket.on('optimistic:rollback', (data: {
    surveyId: string;
    updateId: string;
  }) => {
    const room = `survey:${data.surveyId}`;
    
    io.to(room).emit('optimistic:rollback:execute', {
      ...data,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });
}
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket-auth';

interface ActivityEvent {
  id: string;
  type: 'survey_created' | 'survey_updated' | 'response_submitted' | 
        'user_joined' | 'user_left' | 'comment_added' | 'export_generated';
  userId: string;
  userName: string;
  surveyId?: string;
  details: string;
  metadata?: any;
  timestamp: string;
}

export function handleActivity(io: Server, socket: AuthenticatedSocket) {
  // Subscribe to activity feed
  socket.on('activity:subscribe', async (scope: 'global' | 'survey', surveyId?: string) => {
    if (scope === 'global') {
      await socket.join('activity:global');
    } else if (scope === 'survey' && surveyId) {
      await socket.join(`activity:survey:${surveyId}`);
    }
    
    socket.emit('activity:subscribed', {
      scope,
      surveyId,
      timestamp: new Date().toISOString(),
    });
  });

  // Log new activity
  socket.on('activity:log', (data: Omit<ActivityEvent, 'id' | 'userId' | 'userName' | 'timestamp'>) => {
    const event: ActivityEvent = {
      ...data,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: socket.userId!,
      userName: socket.userName!,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to global feed
    io.to('activity:global').emit('activity:new', event);

    // If survey-specific, also broadcast to survey feed
    if (data.surveyId) {
      io.to(`activity:survey:${data.surveyId}`).emit('activity:new', event);
    }
  });

  // Mark activity as read
  socket.on('activity:read', (activityIds: string[]) => {
    socket.emit('activity:marked:read', {
      activityIds,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Get activity history
  socket.on('activity:history:request', async (data: {
    scope: 'global' | 'survey';
    surveyId?: string;
    limit?: number;
    offset?: number;
  }) => {
    // This would typically fetch from database
    // For now, emit empty history
    socket.emit('activity:history:response', {
      activities: [],
      total: 0,
      limit: data.limit || 50,
      offset: data.offset || 0,
      timestamp: new Date().toISOString(),
    });
  });

  // Filter activity feed
  socket.on('activity:filter', (filters: {
    types?: string[];
    userIds?: string[];
    surveyIds?: string[];
    dateFrom?: string;
    dateTo?: string;
  }) => {
    // Store user's filter preferences
    socket.emit('activity:filter:applied', {
      filters,
      timestamp: new Date().toISOString(),
    });
  });
}
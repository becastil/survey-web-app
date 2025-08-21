import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket-auth';

interface AnalyticsUpdate {
  surveyId: string;
  type: 'response' | 'completion' | 'dropout' | 'view';
  data: any;
  metadata?: {
    responseId?: string;
    questionId?: string;
    duration?: number;
    device?: string;
    location?: string;
  };
}

interface MetricUpdate {
  surveyId: string;
  metric: string;
  value: number;
  change: number;
  timestamp: string;
}

export function handleAnalytics(io: Server, socket: AuthenticatedSocket) {
  // Join analytics room for a survey
  socket.on('analytics:subscribe', async (surveyId: string) => {
    const room = `analytics:${surveyId}`;
    await socket.join(room);
    
    socket.emit('analytics:subscribed', {
      surveyId,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave analytics room
  socket.on('analytics:unsubscribe', async (surveyId: string) => {
    const room = `analytics:${surveyId}`;
    await socket.leave(room);
  });

  // Broadcast new survey response
  socket.on('analytics:response:new', (data: AnalyticsUpdate) => {
    const room = `analytics:${data.surveyId}`;
    
    const update = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all users watching analytics
    io.to(room).emit('analytics:response:received', update);

    // Also broadcast to survey room for general awareness
    io.to(`survey:${data.surveyId}`).emit('survey:new:response', {
      surveyId: data.surveyId,
      responseId: data.metadata?.responseId,
      timestamp: new Date().toISOString(),
    });
  });

  // Real-time metric updates
  socket.on('metrics:update', (data: MetricUpdate) => {
    const room = `analytics:${data.surveyId}`;
    
    io.to(room).emit('metrics:updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Live response tracking
  socket.on('response:progress', (data: {
    surveyId: string;
    responseId: string;
    progress: number;
    currentQuestion: number;
    totalQuestions: number;
  }) => {
    const room = `analytics:${data.surveyId}`;
    
    io.to(room).emit('response:progress:update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Completion rate updates
  socket.on('completion:rate:update', (data: {
    surveyId: string;
    completionRate: number;
    completedCount: number;
    totalCount: number;
  }) => {
    const room = `analytics:${data.surveyId}`;
    
    io.to(room).emit('completion:rate:changed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Drop-off tracking
  socket.on('response:dropout', (data: {
    surveyId: string;
    responseId: string;
    questionId: string;
    questionIndex: number;
  }) => {
    const room = `analytics:${data.surveyId}`;
    
    io.to(room).emit('response:dropout:detected', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Real-time chart data updates
  socket.on('chart:data:request', async (data: {
    surveyId: string;
    chartType: string;
    questionId?: string;
  }) => {
    // This would typically fetch from database
    // For now, emit sample update
    socket.emit('chart:data:update', {
      surveyId: data.surveyId,
      chartType: data.chartType,
      questionId: data.questionId,
      data: {
        // Chart-specific data structure
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Demographic distribution updates
  socket.on('demographics:update', (data: {
    surveyId: string;
    demographics: {
      age?: { [key: string]: number };
      location?: { [key: string]: number };
      device?: { [key: string]: number };
    };
  }) => {
    const room = `analytics:${data.surveyId}`;
    
    io.to(room).emit('demographics:updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
}
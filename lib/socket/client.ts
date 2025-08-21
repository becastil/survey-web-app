import { io, Socket } from 'socket.io-client';
import { createClient } from '@/lib/supabase/client';

export interface SocketClient extends Socket {
  userId?: string;
  userName?: string;
}

class SocketManager {
  private socket: SocketClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(): Promise<SocketClient> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                     (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    this.socket = io(socketUrl, {
      auth: {
        token: session.access_token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
    }) as SocketClient;

    this.setupEventHandlers();
    
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket initialization failed'));
        return;
      }

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        resolve(this.socket as SocketClient);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error);
        }
      });

      // Set timeout for initial connection
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connected', (data) => {
      this.socket!.userId = data.userId;
      this.socket!.userName = data.userName;
      this.emit('socket:connected', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('socket:disconnected', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.emit('socket:reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      this.emit('socket:reconnecting', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      this.emit('socket:reconnect_error', { error });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after', this.maxReconnectAttempts, 'attempts');
      this.emit('socket:reconnect_failed', {});
    });

    // Ping/pong for health check
    this.socket.on('ping', (timestamp) => {
      this.socket?.emit('pong', timestamp);
      this.emit('socket:ping', { timestamp });
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket:error', { error });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): SocketClient | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event emitter pattern for internal events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  // Join a survey room
  joinSurvey(surveyId: string) {
    this.socket?.emit('join:survey', surveyId);
  }

  // Leave a survey room
  leaveSurvey(surveyId: string) {
    this.socket?.emit('leave:survey', surveyId);
  }

  // Subscribe to analytics
  subscribeToAnalytics(surveyId: string) {
    this.socket?.emit('analytics:subscribe', surveyId);
  }

  // Unsubscribe from analytics
  unsubscribeFromAnalytics(surveyId: string) {
    this.socket?.emit('analytics:unsubscribe', surveyId);
  }
}

// Singleton instance
export const socketManager = new SocketManager();
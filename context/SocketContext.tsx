'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { socketManager, SocketClient } from '@/lib/socket/client';
import { useToast } from '@/components/ui/use-toast';

interface SocketContextValue {
  socket: SocketClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinSurvey: (surveyId: string) => void;
  leaveSurvey: (surveyId: string) => void;
  subscribeToAnalytics: (surveyId: string) => void;
  unsubscribeFromAnalytics: (surveyId: string) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<SocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const connectedSocket = await socketManager.connect();
      setSocket(connectedSocket);
      setIsConnected(true);
      
      toast({
        title: 'Connected',
        description: 'Real-time collaboration is now active',
        variant: 'default',
      });
    } catch (error) {
      const err = error as Error;
      setConnectionError(err);
      setIsConnected(false);
      
      toast({
        title: 'Connection Failed',
        description: 'Unable to establish real-time connection. Some features may be limited.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, toast]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setSocket(null);
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  const joinSurvey = useCallback((surveyId: string) => {
    socketManager.joinSurvey(surveyId);
  }, []);

  const leaveSurvey = useCallback((surveyId: string) => {
    socketManager.leaveSurvey(surveyId);
  }, []);

  const subscribeToAnalytics = useCallback((surveyId: string) => {
    socketManager.subscribeToAnalytics(surveyId);
  }, []);

  const unsubscribeFromAnalytics = useCallback((surveyId: string) => {
    socketManager.unsubscribeFromAnalytics(surveyId);
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Real-time connection lost. Attempting to reconnect...',
        variant: 'destructive',
      });
    };

    const handleReconnected = () => {
      setIsConnected(true);
      toast({
        title: 'Reconnected',
        description: 'Real-time connection restored',
        variant: 'default',
      });
    };

    const handleReconnectFailed = () => {
      setIsConnected(false);
      toast({
        title: 'Connection Lost',
        description: 'Unable to reconnect. Please refresh the page.',
        variant: 'destructive',
      });
    };

    const handleError = ({ error }: { error: Error }) => {
      console.error('Socket error:', error);
      setConnectionError(error);
    };

    socketManager.on('socket:connected', handleConnected);
    socketManager.on('socket:disconnected', handleDisconnected);
    socketManager.on('socket:reconnected', handleReconnected);
    socketManager.on('socket:reconnect_failed', handleReconnectFailed);
    socketManager.on('socket:error', handleError);

    return () => {
      socketManager.off('socket:connected', handleConnected);
      socketManager.off('socket:disconnected', handleDisconnected);
      socketManager.off('socket:reconnected', handleReconnected);
      socketManager.off('socket:reconnect_failed', handleReconnectFailed);
      socketManager.off('socket:error', handleError);
    };
  }, [toast]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: SocketContextValue = {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    joinSurvey,
    leaveSurvey,
    subscribeToAnalytics,
    unsubscribeFromAnalytics,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
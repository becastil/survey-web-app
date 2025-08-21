'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';

export interface User {
  userId: string;
  userName: string;
  socketId?: string;
  status?: 'online' | 'away' | 'busy';
  currentPage?: string;
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
}

export interface PresenceState {
  users: Map<string, User>;
  activeUsers: User[];
  userCount: number;
}

export function usePresence(surveyId?: string) {
  const { socket, isConnected } = useSocket();
  const [presence, setPresence] = useState<PresenceState>({
    users: new Map(),
    activeUsers: [],
    userCount: 0,
  });
  const [myStatus, setMyStatus] = useState<'online' | 'away' | 'busy'>('online');
  const [typingUsers, setTypingUsers] = useState<Map<string, { fieldId: string; userName: string }>>(new Map());

  // Update presence status
  const updateStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    if (!socket || !isConnected) return;
    
    socket.emit('presence:update', { status });
    setMyStatus(status);
  }, [socket, isConnected]);

  // Update cursor position
  const updateCursor = useCallback((position: { x: number; y: number; elementId?: string }) => {
    if (!socket || !isConnected || !surveyId) return;
    
    socket.emit('cursor:move', { surveyId, position });
  }, [socket, isConnected, surveyId]);

  // Focus/blur field
  const focusField = useCallback((fieldId: string) => {
    if (!socket || !isConnected || !surveyId) return;
    
    socket.emit('field:focus', { surveyId, fieldId });
  }, [socket, isConnected, surveyId]);

  const blurField = useCallback((fieldId: string) => {
    if (!socket || !isConnected || !surveyId) return;
    
    socket.emit('field:blur', { surveyId, fieldId });
  }, [socket, isConnected, surveyId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle room participants
    const handleParticipants = ({ participants }: { surveyId: string; participants: User[] }) => {
      const newUsers = new Map<string, User>();
      participants.forEach(user => {
        newUsers.set(user.userId, user);
      });
      
      setPresence({
        users: newUsers,
        activeUsers: participants,
        userCount: participants.length,
      });
    };

    // Handle user joined
    const handleUserJoined = (data: { userId: string; userName: string }) => {
      setPresence(prev => {
        const newUsers = new Map(prev.users);
        newUsers.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          status: 'online',
        });
        
        return {
          users: newUsers,
          activeUsers: Array.from(newUsers.values()),
          userCount: newUsers.size,
        };
      });
    };

    // Handle user left
    const handleUserLeft = (data: { userId: string }) => {
      setPresence(prev => {
        const newUsers = new Map(prev.users);
        newUsers.delete(data.userId);
        
        return {
          users: newUsers,
          activeUsers: Array.from(newUsers.values()),
          userCount: newUsers.size,
        };
      });
      
      // Remove from typing users
      setTypingUsers(prev => {
        const newTyping = new Map(prev);
        newTyping.delete(data.userId);
        return newTyping;
      });
    };

    // Handle presence update
    const handlePresenceUpdate = (data: User) => {
      setPresence(prev => {
        const newUsers = new Map(prev.users);
        const existingUser = newUsers.get(data.userId);
        newUsers.set(data.userId, { ...existingUser, ...data });
        
        return {
          users: newUsers,
          activeUsers: Array.from(newUsers.values()),
          userCount: newUsers.size,
        };
      });
    };

    // Handle cursor movement
    const handleCursorMove = (data: { userId: string; userName: string; position: any }) => {
      setPresence(prev => {
        const newUsers = new Map(prev.users);
        const user = newUsers.get(data.userId);
        if (user) {
          newUsers.set(data.userId, { ...user, cursor: data.position });
        }
        
        return {
          users: newUsers,
          activeUsers: Array.from(newUsers.values()),
          userCount: newUsers.size,
        };
      });
    };

    // Handle typing indicators
    const handleTypingIndicator = (data: { 
      userId: string; 
      userName: string; 
      fieldId: string; 
      isTyping: boolean;
    }) => {
      setTypingUsers(prev => {
        const newTyping = new Map(prev);
        
        if (data.isTyping) {
          newTyping.set(data.userId, {
            fieldId: data.fieldId,
            userName: data.userName,
          });
        } else {
          newTyping.delete(data.userId);
        }
        
        return newTyping;
      });
    };

    // Subscribe to events
    socket.on('room:participants', handleParticipants);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.on('user:disconnected', handleUserLeft);
    socket.on('presence:updated', handlePresenceUpdate);
    socket.on('cursor:moved', handleCursorMove);
    socket.on('typing:indicator', handleTypingIndicator);

    return () => {
      socket.off('room:participants', handleParticipants);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      socket.off('user:disconnected', handleUserLeft);
      socket.off('presence:updated', handlePresenceUpdate);
      socket.off('cursor:moved', handleCursorMove);
      socket.off('typing:indicator', handleTypingIndicator);
    };
  }, [socket, isConnected]);

  return {
    presence,
    myStatus,
    typingUsers,
    updateStatus,
    updateCursor,
    focusField,
    blurField,
  };
}
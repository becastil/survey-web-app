'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/components/ui/use-toast';

interface CollaborativeUpdate {
  surveyId: string;
  questionId?: string;
  field: string;
  value: any;
  version: number;
  userId?: string;
  userName?: string;
  timestamp?: string;
}

interface OptimisticUpdate {
  updateId: string;
  changes: any;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface ConflictInfo {
  conflictId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  remoteUser: string;
}

export function useCollaboration(surveyId: string) {
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const [version, setVersion] = useState(0);
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(new Map());
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const updateQueue = useRef<CollaborativeUpdate[]>([]);
  const processingQueue = useRef(false);

  // Send update to server
  const sendUpdate = useCallback((update: Omit<CollaborativeUpdate, 'surveyId' | 'version'>) => {
    if (!socket || !isConnected) {
      // Queue update for when connection is restored
      updateQueue.current.push({
        ...update,
        surveyId,
        version: version + 1,
      });
      return;
    }

    const fullUpdate: CollaborativeUpdate = {
      ...update,
      surveyId,
      version: version + 1,
    };

    socket.emit('survey:update', fullUpdate);
    setVersion(v => v + 1);
  }, [socket, isConnected, surveyId, version]);

  // Send optimistic update
  const sendOptimisticUpdate = useCallback((changes: any) => {
    if (!socket || !isConnected) return null;

    const updateId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store optimistic update locally
    setOptimisticUpdates(prev => {
      const newUpdates = new Map(prev);
      newUpdates.set(updateId, {
        updateId,
        changes,
        timestamp: Date.now(),
        status: 'pending',
      });
      return newUpdates;
    });

    // Send to server
    socket.emit('optimistic:update', {
      surveyId,
      updateId,
      changes,
    });

    return updateId;
  }, [socket, isConnected, surveyId]);

  // Rollback optimistic update
  const rollbackUpdate = useCallback((updateId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('optimistic:rollback', {
      surveyId,
      updateId,
    });

    setOptimisticUpdates(prev => {
      const newUpdates = new Map(prev);
      const update = newUpdates.get(updateId);
      if (update) {
        newUpdates.set(updateId, { ...update, status: 'failed' });
      }
      return newUpdates;
    });
  }, [socket, isConnected, surveyId]);

  // Lock field for editing
  const lockField = useCallback((fieldId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('field:lock', { surveyId, fieldId });
    setLockedFields(prev => new Set(prev).add(fieldId));
  }, [socket, isConnected, surveyId]);

  // Unlock field
  const unlockField = useCallback((fieldId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('field:unlock', { surveyId, fieldId });
    setLockedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldId);
      return newSet;
    });
  }, [socket, isConnected, surveyId]);

  // Reorder questions
  const reorderQuestions = useCallback((questionIds: string[]) => {
    if (!socket || !isConnected) return;

    socket.emit('questions:reorder', {
      surveyId,
      questionIds,
      version: version + 1,
    });
    setVersion(v => v + 1);
  }, [socket, isConnected, surveyId, version]);

  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string, resolution: 'accept' | 'reject' | 'merge', mergedValue?: any) => {
    if (!socket || !isConnected) return;

    socket.emit('conflict:resolve', {
      surveyId,
      conflictId,
      resolution,
      mergedValue,
    });

    setConflicts(prev => prev.filter(c => c.conflictId !== conflictId));
  }, [socket, isConnected, surveyId]);

  // Process queued updates
  const processQueue = useCallback(async () => {
    if (processingQueue.current || !socket || !isConnected || updateQueue.current.length === 0) {
      return;
    }

    processingQueue.current = true;
    
    while (updateQueue.current.length > 0) {
      const update = updateQueue.current.shift();
      if (update) {
        socket.emit('survey:update', update);
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
      }
    }
    
    processingQueue.current = false;
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle incoming updates
    const handleSurveyUpdate = (data: CollaborativeUpdate) => {
      setVersion(data.version);
      
      // Show notification for other users' updates
      if (data.userId !== socket.userId) {
        toast({
          title: 'Survey Updated',
          description: `${data.userName} updated ${data.field}`,
          variant: 'default',
        });
      }
    };

    // Handle update acknowledgment
    const handleUpdateAck = (data: { success: boolean; version: number }) => {
      if (data.success) {
        setVersion(data.version);
      }
    };

    // Handle field lock/unlock
    const handleFieldLocked = (data: { fieldId: string; userId: string; userName: string }) => {
      if (data.userId !== socket.userId) {
        setLockedFields(prev => new Set(prev).add(data.fieldId));
      }
    };

    const handleFieldUnlocked = (data: { fieldId: string }) => {
      setLockedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.fieldId);
        return newSet;
      });
    };

    // Handle optimistic update tracking
    const handleOptimisticTracking = (data: { updateId: string }) => {
      setOptimisticUpdates(prev => {
        const newUpdates = new Map(prev);
        const update = newUpdates.get(data.updateId);
        if (update) {
          newUpdates.set(data.updateId, { ...update, status: 'confirmed' });
        }
        return newUpdates;
      });
    };

    // Handle rollback
    const handleRollback = (data: { updateId: string }) => {
      setOptimisticUpdates(prev => {
        const newUpdates = new Map(prev);
        newUpdates.delete(data.updateId);
        return newUpdates;
      });
      
      toast({
        title: 'Update Rolled Back',
        description: 'Your recent change was rolled back due to a conflict',
        variant: 'destructive',
      });
    };

    // Handle conflict detection
    const handleConflict = (data: ConflictInfo) => {
      setConflicts(prev => [...prev, data]);
      
      toast({
        title: 'Edit Conflict Detected',
        description: `${data.remoteUser} also edited ${data.field}. Please resolve the conflict.`,
        variant: 'destructive',
      });
    };

    // Subscribe to events
    socket.on('survey:updated', handleSurveyUpdate);
    socket.on('survey:update:ack', handleUpdateAck);
    socket.on('field:locked', handleFieldLocked);
    socket.on('field:unlocked', handleFieldUnlocked);
    socket.on('optimistic:update:tracking', handleOptimisticTracking);
    socket.on('optimistic:rollback:execute', handleRollback);
    socket.on('conflict:detected', handleConflict);

    // Process any queued updates
    processQueue();

    return () => {
      socket.off('survey:updated', handleSurveyUpdate);
      socket.off('survey:update:ack', handleUpdateAck);
      socket.off('field:locked', handleFieldLocked);
      socket.off('field:unlocked', handleFieldUnlocked);
      socket.off('optimistic:update:tracking', handleOptimisticTracking);
      socket.off('optimistic:rollback:execute', handleRollback);
      socket.off('conflict:detected', handleConflict);
    };
  }, [socket, isConnected, processQueue, toast]);

  // Process queue when connection is restored
  useEffect(() => {
    if (isConnected) {
      processQueue();
    }
  }, [isConnected, processQueue]);

  return {
    version,
    lockedFields,
    optimisticUpdates,
    conflicts,
    sendUpdate,
    sendOptimisticUpdate,
    rollbackUpdate,
    lockField,
    unlockField,
    reorderQuestions,
    resolveConflict,
  };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/components/ui/use-toast';

interface Response {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentId: string;
  respondentName: string;
  respondentEmail?: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  completionRate: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  answers: Record<string, any>;
  metadata?: {
    device?: string;
    location?: string;
    browser?: string;
  };
}

export function useResponseStream(surveyId?: string) {
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load initial responses
  const loadResponses = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      
      // Mock data for now - would be API call
      const mockResponses: Response[] = Array.from({ length: 20 }, (_, i) => ({
        id: `response-${pageNum}-${i}`,
        surveyId: surveyId || 'survey-1',
        surveyTitle: 'Healthcare Benefits Survey 2025',
        respondentId: `user-${pageNum}-${i}`,
        respondentName: `User ${pageNum * 20 + i}`,
        respondentEmail: `user${pageNum * 20 + i}@example.com`,
        status: ['completed', 'in_progress', 'abandoned'][Math.floor(Math.random() * 3)] as any,
        completionRate: Math.floor(Math.random() * 100),
        startedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        completedAt: Math.random() > 0.3 ? new Date().toISOString() : undefined,
        duration: Math.floor(Math.random() * 1800),
        answers: {
          q1: 'Sample answer',
          q2: 'Another answer',
        },
        metadata: {
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          location: 'United States',
          browser: 'Chrome',
        },
      }));

      if (pageNum === 1) {
        setResponses(mockResponses);
      } else {
        setResponses(prev => [...prev, ...mockResponses]);
      }
      
      setTotalCount(100); // Mock total
      setHasMore(pageNum * 20 < 100);
      
    } catch (error) {
      console.error('Failed to load responses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load responses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [surveyId, toast]);

  // Load more responses
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await loadResponses(nextPage);
  }, [loading, hasMore, page, loadResponses]);

  // Filter responses
  const filterResponses = useCallback((filters: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minCompletion?: number;
  }) => {
    let filtered = [...responses];
    
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.startedAt) >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.startedAt) <= filters.dateTo!);
    }
    
    if (filters.minCompletion) {
      filtered = filtered.filter(r => r.completionRate >= filters.minCompletion!);
    }
    
    return filtered;
  }, [responses]);

  // Export responses
  const exportResponses = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Name', 'Email', 'Status', 'Completion', 'Started', 'Duration'];
      const rows = responses.map(r => [
        r.id,
        r.respondentName,
        r.respondentEmail || '',
        r.status,
        `${r.completionRate}%`,
        r.startedAt,
        r.duration ? `${Math.round(r.duration / 60)}m` : '',
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${responses.length} responses to CSV`,
      });
    } else {
      // Export as JSON
      const json = JSON.stringify(responses, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${responses.length} responses to JSON`,
      });
    }
  }, [responses, toast]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewResponse = (data: any) => {
      const newResponse: Response = {
        id: data.metadata?.responseId || `response-${Date.now()}`,
        surveyId: data.surveyId,
        surveyTitle: 'Healthcare Benefits Survey 2025',
        respondentId: `user-${Date.now()}`,
        respondentName: 'New Respondent',
        status: 'in_progress',
        completionRate: 0,
        startedAt: new Date().toISOString(),
        answers: data.data || {},
        metadata: data.metadata,
      };

      setResponses(prev => [newResponse, ...prev]);
      setTotalCount(prev => prev + 1);
      
      toast({
        title: 'New Response',
        description: `${newResponse.respondentName} started the survey`,
        variant: 'success',
      });
    };

    const handleResponseUpdate = (data: any) => {
      setResponses(prev => prev.map(r => 
        r.id === data.responseId
          ? { ...r, ...data.updates }
          : r
      ));
    };

    const handleResponseComplete = (data: any) => {
      setResponses(prev => prev.map(r => 
        r.id === data.responseId
          ? { 
              ...r, 
              status: 'completed', 
              completionRate: 100,
              completedAt: new Date().toISOString(),
              duration: data.duration,
            }
          : r
      ));
      
      toast({
        title: 'Response Completed',
        description: 'A respondent completed the survey',
        variant: 'success',
      });
    };

    socket.on('analytics:response:received', handleNewResponse);
    socket.on('response:progress:update', handleResponseUpdate);
    socket.on('response:completed', handleResponseComplete);

    return () => {
      socket.off('analytics:response:received', handleNewResponse);
      socket.off('response:progress:update', handleResponseUpdate);
      socket.off('response:completed', handleResponseComplete);
    };
  }, [socket, isConnected, toast]);

  // Initial load
  useEffect(() => {
    loadResponses(1);
  }, [loadResponses]);

  return {
    responses,
    loading,
    hasMore,
    totalCount,
    loadMore,
    filterResponses,
    exportResponses,
  };
}
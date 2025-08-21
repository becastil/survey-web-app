'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/components/ui/use-toast';

interface Metrics {
  totalResponses: number;
  responseGrowth: number;
  completionRate: number;
  completionChange: number;
  avgCompletionTime: number;
  timeChange: number;
  satisfactionScore: number;
  satisfactionChange: number;
  activeUsers: number;
  totalSurveys: number;
}

interface ChartData {
  responseTrend: Array<{ date: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  completionFunnel: Array<{ stage: string; count: number }>;
  responseHeatmap: Array<{ date: string; count: number }>;
  geographicDistribution?: Map<string, number>;
}

export function useLiveMetrics(surveyId?: string) {
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics>({
    totalResponses: 0,
    responseGrowth: 0,
    completionRate: 0,
    completionChange: 0,
    avgCompletionTime: 0,
    timeChange: 0,
    satisfactionScore: 0,
    satisfactionChange: 0,
    activeUsers: 0,
    totalSurveys: 0,
  });
  
  const [charts, setCharts] = useState<ChartData>({
    responseTrend: [],
    statusDistribution: [],
    deviceBreakdown: [],
    completionFunnel: [],
    responseHeatmap: [],
  });
  
  const [loading, setLoading] = useState(true);

  // Generate mock data
  const generateMockData = useCallback(() => {
    // Generate trend data for last 14 days
    const trendData = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 20,
      };
    });

    // Status distribution
    const statusData = [
      { status: 'Completed', count: Math.floor(Math.random() * 100) + 50 },
      { status: 'In Progress', count: Math.floor(Math.random() * 30) + 10 },
      { status: 'Abandoned', count: Math.floor(Math.random() * 20) + 5 },
    ];

    // Device breakdown
    const deviceData = [
      { device: 'Desktop', count: Math.floor(Math.random() * 100) + 40 },
      { device: 'Mobile', count: Math.floor(Math.random() * 80) + 30 },
      { device: 'Tablet', count: Math.floor(Math.random() * 30) + 10 },
    ];

    // Completion funnel
    const funnelData = [
      { stage: 'Started', count: 100 },
      { stage: 'Q1-Q5', count: 85 },
      { stage: 'Q6-Q10', count: 70 },
      { stage: 'Q11-Q15', count: 55 },
      { stage: 'Completed', count: 45 },
    ];

    // Response heatmap (last 30 days)
    const heatmapData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 40),
      };
    });

    return {
      metrics: {
        totalResponses: Math.floor(Math.random() * 500) + 200,
        responseGrowth: Math.random() * 30 - 5, // -5% to +25%
        completionRate: Math.floor(Math.random() * 30) + 60, // 60-90%
        completionChange: Math.random() * 10 - 2, // -2% to +8%
        avgCompletionTime: Math.floor(Math.random() * 10) + 8, // 8-18 minutes
        timeChange: Math.random() * 5 - 2, // -2% to +3%
        satisfactionScore: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
        satisfactionChange: Math.random() * 5 - 1, // -1% to +4%
        activeUsers: Math.floor(Math.random() * 20) + 5,
        totalSurveys: Math.floor(Math.random() * 10) + 3,
      },
      charts: {
        responseTrend: trendData,
        statusDistribution: statusData,
        deviceBreakdown: deviceData,
        completionFunnel: funnelData,
        responseHeatmap: heatmapData,
      },
    };
  }, []);

  // Load initial metrics
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // In production, this would be an API call
      const mockData = generateMockData();
      setMetrics(mockData.metrics);
      setCharts(mockData.charts);
      
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [generateMockData, toast]);

  // Refresh metrics
  const refresh = useCallback(() => {
    loadMetrics();
    toast({
      title: 'Metrics Refreshed',
      description: 'Dashboard metrics have been updated',
    });
  }, [loadMetrics, toast]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMetricUpdate = (data: any) => {
      setMetrics(prev => ({
        ...prev,
        ...data.metrics,
      }));
    };

    const handleChartUpdate = (data: any) => {
      setCharts(prev => ({
        ...prev,
        [data.chartType]: data.data,
      }));
    };

    const handleResponseReceived = () => {
      // Increment total responses
      setMetrics(prev => ({
        ...prev,
        totalResponses: prev.totalResponses + 1,
      }));

      // Update trend chart
      setCharts(prev => {
        const today = new Date().toISOString().split('T')[0];
        const updatedTrend = [...prev.responseTrend];
        const todayIndex = updatedTrend.findIndex(item => item.date === today);
        
        if (todayIndex >= 0) {
          updatedTrend[todayIndex].count += 1;
        } else {
          updatedTrend.push({ date: today, count: 1 });
        }
        
        return {
          ...prev,
          responseTrend: updatedTrend.slice(-14), // Keep last 14 days
        };
      });
    };

    const handleCompletionUpdate = (data: any) => {
      setMetrics(prev => ({
        ...prev,
        completionRate: data.completionRate,
        completionChange: data.change,
      }));
    };

    socket.on('metrics:updated', handleMetricUpdate);
    socket.on('chart:data:update', handleChartUpdate);
    socket.on('analytics:response:received', handleResponseReceived);
    socket.on('completion:rate:changed', handleCompletionUpdate);

    return () => {
      socket.off('metrics:updated', handleMetricUpdate);
      socket.off('chart:data:update', handleChartUpdate);
      socket.off('analytics:response:received', handleResponseReceived);
      socket.off('completion:rate:changed', handleCompletionUpdate);
    };
  }, [socket, isConnected]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Simulate small metric changes for demo
        setMetrics(prev => ({
          ...prev,
          totalResponses: prev.totalResponses + Math.floor(Math.random() * 3),
          activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Initial load
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    charts,
    loading,
    refresh,
  };
}
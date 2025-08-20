/**
 * @module AnomalyDetection
 * @description Real-time anomaly detection with agent analysis
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgent } from '@/hooks/useAgent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

interface DataPoint {
  timestamp: string;
  value: number;
  expected?: number;
  lowerBound?: number;
  upperBound?: number;
}

interface Anomaly {
  id: string;
  timestamp: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'pattern' | 'missing';
  confidence: number;
  explanation?: string;
  suggestedAction?: string;
}

interface AnomalyDetectionProps {
  data: DataPoint[];
  metric: string;
  surveyId?: string;
  threshold?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onAnomalyDetected?: (anomaly: Anomaly) => void;
  className?: string;
}

export function AnomalyDetection({
  data,
  metric,
  surveyId,
  threshold = 2, // Standard deviations
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  onAnomalyDetected,
  className
}: AnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(autoRefresh);

  // Use anomaly detection agent
  const anomalyAgent = useAgent('anomaly-detector', {
    onSuccess: (result) => {
      if (result.anomalies) {
        setAnomalies(result.anomalies);
        result.anomalies.forEach((anomaly: Anomaly) => {
          if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
            onAnomalyDetected?.(anomaly);
          }
        });
      }
    }
  });

  // Calculate statistics for visualization
  const statistics = useMemo(() => {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate bounds for visualization
    const dataWithBounds = data.map(point => ({
      ...point,
      expected: mean,
      lowerBound: mean - (threshold * stdDev),
      upperBound: mean + (threshold * stdDev)
    }));
    
    return {
      mean,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      dataWithBounds
    };
  }, [data, threshold]);

  // Run anomaly detection
  useEffect(() => {
    if (data.length > 0) {
      anomalyAgent.execute({
        data: {
          metric,
          dataPoints: data,
          threshold,
          surveyId
        },
        context: {
          needsKBContext: true,
          kbPrompt: `Analyze time series data for ${metric} and detect anomalies`
        }
      });
    }
  }, [data, metric, threshold, surveyId]);

  // Auto-refresh monitoring
  useEffect(() => {
    if (!isMonitoring || !autoRefresh) return;
    
    const interval = setInterval(() => {
      anomalyAgent.execute({
        data: {
          metric,
          dataPoints: data,
          threshold,
          surveyId
        }
      });
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [isMonitoring, autoRefresh, refreshInterval, data]);

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-blue-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'low':
      case 'medium':
        return <Activity className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getHealthScore = () => {
    if (anomalies.length === 0) return 100;
    
    const severityWeights = {
      low: 5,
      medium: 15,
      high: 30,
      critical: 50
    };
    
    const totalPenalty = anomalies.reduce((sum, anomaly) => {
      return sum + severityWeights[anomaly.severity];
    }, 0);
    
    return Math.max(0, 100 - totalPenalty);
  };

  const healthScore = getHealthScore();
  const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Anomaly Detection</CardTitle>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? (
                <>
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Monitoring
                </>
              ) : (
                'Paused'
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? (
                <Shield className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => anomalyAgent.execute({ data: { metric, dataPoints: data, threshold } })}
              disabled={anomalyAgent.loading}
            >
              <RefreshCw className={cn('h-4 w-4', anomalyAgent.loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        
        {/* Health Score */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Health</span>
            <span className={cn(
              'font-medium',
              healthStatus === 'healthy' && 'text-green-500',
              healthStatus === 'warning' && 'text-yellow-500',
              healthStatus === 'critical' && 'text-red-500'
            )}>
              {healthScore}%
            </span>
          </div>
          <Progress 
            value={healthScore} 
            className={cn(
              'h-2',
              healthStatus === 'healthy' && '[&>div]:bg-green-500',
              healthStatus === 'warning' && '[&>div]:bg-yellow-500',
              healthStatus === 'critical' && '[&>div]:bg-red-500'
            )}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Visualization */}
        {statistics && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={statistics.dataWithBounds}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                
                {/* Confidence bands */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                
                {/* Expected value line */}
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                
                {/* Actual values */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const anomaly = anomalies.find(a => a.timestamp === props.payload.timestamp);
                    if (anomaly) {
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={6}
                          fill={
                            anomaly.severity === 'critical' ? '#ef4444' :
                            anomaly.severity === 'high' ? '#f97316' :
                            anomaly.severity === 'medium' ? '#eab308' :
                            '#3b82f6'
                          }
                          stroke="#fff"
                          strokeWidth={2}
                          onClick={() => setSelectedAnomaly(anomaly)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    }
                    return <circle cx={props.cx} cy={props.cy} r={3} fill="#6366f1" />;
                  }}
                />
                
                {/* Mark anomalies */}
                {anomalies.map((anomaly) => (
                  <ReferenceLine
                    key={anomaly.id}
                    x={anomaly.timestamp}
                    stroke={
                      anomaly.severity === 'critical' ? '#ef4444' :
                      anomaly.severity === 'high' ? '#f97316' :
                      '#eab308'
                    }
                    strokeDasharray="3 3"
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Anomalies List */}
        <AnimatePresence>
          {showDetails && anomalies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Detected Anomalies</h4>
                <Badge variant="outline">{anomalies.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anomalies.map((anomaly) => (
                  <Alert
                    key={anomaly.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedAnomaly?.id === anomaly.id && 'border-primary'
                    )}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <div className={cn('flex items-start gap-2', getSeverityColor(anomaly.severity))}>
                      {getSeverityIcon(anomaly.severity)}
                      <div className="flex-1">
                        <AlertTitle className="text-sm">
                          {anomaly.type === 'spike' && 'Unusual Spike'}
                          {anomaly.type === 'drop' && 'Sudden Drop'}
                          {anomaly.type === 'pattern' && 'Pattern Anomaly'}
                          {anomaly.type === 'missing' && 'Missing Data'}
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          <div className="flex items-center gap-4">
                            <span>Value: {anomaly.value.toFixed(2)}</span>
                            <span>Expected: {anomaly.expected.toFixed(2)}</span>
                            <Badge variant="outline" className="text-xs">
                              {(anomaly.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          {anomaly.explanation && (
                            <p className="mt-1">{anomaly.explanation}</p>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* No Anomalies State */}
        {anomalies.length === 0 && !anomalyAgent.loading && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">No Anomalies Detected</p>
            <p className="text-xs text-muted-foreground mt-1">
              All metrics are within expected ranges
            </p>
          </div>
        )}
        
        {/* Selected Anomaly Details */}
        <AnimatePresence>
          {selectedAnomaly && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-muted rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Anomaly Details</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnomaly(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>
                  <p className="font-medium">{new Date(selectedAnomaly.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deviation:</span>
                  <p className="font-medium">{(selectedAnomaly.deviation * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {selectedAnomaly.suggestedAction && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle className="text-sm">Suggested Action</AlertTitle>
                  <AlertDescription className="text-xs">
                    {selectedAnomaly.suggestedAction}
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
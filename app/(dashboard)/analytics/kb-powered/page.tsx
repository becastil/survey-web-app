/**
 * @module KBPoweredAnalyticsPage
 * @description Analytics dashboard with full KB and agent integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PowerBILayout } from '@/components/layouts/PowerBILayout';
import { IntelligentChart } from '@/components/analytics/IntelligentChart';
import { AnomalyDetection } from '@/components/analytics/AnomalyDetection';
import { InsightPanel } from '@/components/analytics/InsightPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useArchonQuery } from '@/hooks/useArchonQuery';
import { useAgent } from '@/hooks/useAgent';
import {
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkles,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Mock data generator for demo
function generateMockData() {
  const now = new Date();
  const dataPoints = [];
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseValue = 50 + Math.sin(i / 4) * 20;
    const noise = (Math.random() - 0.5) * 10;
    const anomaly = i === 8 || i === 16 ? 30 : 0; // Add anomalies
    
    dataPoints.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, baseValue + noise + anomaly)
    });
  }
  
  return dataPoints;
}

export default function KBPoweredAnalyticsPage() {
  const [selectedSurvey, setSelectedSurvey] = useState('survey-2024-q1');
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Mock survey data
  const surveyData = {
    responseRate: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Responses',
        data: [45, 52, 38, 65, 59, 40, 52],
        color: '#6366f1'
      }]
    },
    demographics: {
      labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
      datasets: [{
        label: 'Participants',
        data: [120, 280, 195, 140, 85],
        color: '#10b981'
      }]
    },
    satisfaction: {
      labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      datasets: [{
        label: 'Responses',
        data: [156, 234, 98, 45, 12],
        color: '#ec4899'
      }]
    },
    completion: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Started',
          data: [320, 295, 310, 305],
          color: '#f59e0b'
        },
        {
          label: 'Completed',
          data: [280, 265, 285, 278],
          color: '#6366f1'
        }
      ]
    }
  };
  
  const timeSeriesData = generateMockData();
  
  // Use KB to get survey summary
  const { data: surveySummary } = useArchonQuery(
    `Summarize key metrics and trends for ${selectedSurvey}`,
    {
      cacheKey: `summary:${selectedSurvey}`,
      cacheTTL: 300
    }
  );
  
  // Use agent for advanced analytics
  const analyticsAgent = useAgent('analytics-insight');
  
  useEffect(() => {
    // Run analytics agent on mount
    analyticsAgent.execute({
      data: {
        surveyId: selectedSurvey,
        metrics: {
          totalResponses: 820,
          completionRate: 87.5,
          avgSatisfaction: 4.2,
          responseTime: '3.5 days'
        }
      }
    });
  }, [selectedSurvey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const metrics = [
    {
      title: 'Total Responses',
      value: '820',
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      aiInsight: 'Above average for Q1'
    },
    {
      title: 'Completion Rate',
      value: '87.5%',
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle,
      aiInsight: 'Excellent retention'
    },
    {
      title: 'Active Participants',
      value: '234',
      change: '-5.1%',
      trend: 'down',
      icon: Users,
      aiInsight: 'Weekend drop expected'
    },
    {
      title: 'Avg. Satisfaction',
      value: '4.2/5',
      change: '+0.3',
      trend: 'up',
      icon: TrendingUp,
      aiInsight: 'Trending positive'
    }
  ];

  return (
    <PowerBILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">KB-Powered Analytics</h1>
            <p className="text-muted-foreground">
              Real-time insights powered by Archon Knowledge Base
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Brain className="h-3 w-3" />
              AI Enhanced
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'text-xs font-medium',
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {metric.change}
                    </span>
                    {metric.aiInsight && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {metric.aiInsight}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IntelligentChart
                title="Response Rate Trends"
                data={surveyData.responseRate}
                type="line"
                surveyId={selectedSurvey}
                enableInsights={true}
              />
              <IntelligentChart
                title="Demographics Distribution"
                data={surveyData.demographics}
                type="bar"
                surveyId={selectedSurvey}
                enableInsights={true}
              />
              <IntelligentChart
                title="Satisfaction Breakdown"
                data={surveyData.satisfaction}
                type="pie"
                surveyId={selectedSurvey}
                enableInsights={true}
              />
              <IntelligentChart
                title="Completion Funnel"
                data={surveyData.completion}
                type="bar"
                surveyId={selectedSurvey}
                enableInsights={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="anomalies" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnomalyDetection
                data={timeSeriesData}
                metric="Response Rate"
                surveyId={selectedSurvey}
                threshold={2}
                autoRefresh={true}
                refreshInterval={30000}
                onAnomalyDetected={(anomaly) => {
                  console.log('Anomaly detected:', anomaly);
                }}
              />
              <AnomalyDetection
                data={timeSeriesData.map(d => ({ ...d, value: d.value * 0.87 }))}
                metric="Completion Rate"
                surveyId={selectedSurvey}
                threshold={1.5}
                autoRefresh={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <InsightPanel
                  surveyId={selectedSurvey}
                  context={{
                    totalResponses: 820,
                    timeRange,
                    dataPoints: timeSeriesData.length
                  }}
                  initialPrompt="Analyze the current survey performance and provide key insights"
                  streamingEnabled={true}
                />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Segment Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Configure Alerts
                    </Button>
                  </CardContent>
                </Card>
                
                {analyticsAgent.result && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Agent Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className="ml-2" variant="secondary">
                            {analyticsAgent.status}
                          </Badge>
                        </div>
                        {analyticsAgent.result.recommendations && (
                          <div>
                            <p className="font-medium mb-1">Recommendations:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                              {analyticsAgent.result.recommendations.map((rec: string, i: number) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced predictive analytics coming soon</p>
                  <p className="text-sm mt-2">
                    ML models will forecast response rates, identify at-risk participants, and optimize survey timing
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PowerBILayout>
  );
}
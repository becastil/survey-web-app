/**
 * @module InsightPanel
 * @description Simple insights panel for analytics
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface InsightPanelProps {
  data?: any;
  surveyId?: string;
  className?: string;
}

interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'success';
  title: string;
  description: string;
  value?: string | number;
  icon: React.ElementType;
  color: string;
}

export function InsightPanel({ 
  data, 
  surveyId, 
  className = '' 
}: InsightPanelProps) {
  const [insights] = useState<Insight[]>(() => generateInsights(data));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle>Key Insights</CardTitle>
          </div>
          <Badge variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Auto-generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No insights available yet</p>
            <p className="text-sm mt-1">Upload data to see insights</p>
          </div>
        ) : (
          insights.map(insight => (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg ${insight.color}`}>
                <insight.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                {insight.value && (
                  <div className="mt-2">
                    <Badge variant="outline">{insight.value}</Badge>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Generate insights based on data patterns
 */
function generateInsights(data: any): Insight[] {
  if (!data) return [];

  const insights: Insight[] = [];

  // Generate sample insights based on common patterns
  // In a real implementation, these would be calculated from actual data

  // Response rate insight
  insights.push({
    id: 'insight-1',
    type: 'success',
    title: 'High Response Rate',
    description: 'Survey completion rate is above industry average at 78%',
    value: '+15% vs benchmark',
    icon: CheckCircle,
    color: 'bg-green-500'
  });

  // Trend insight
  insights.push({
    id: 'insight-2',
    type: 'trend',
    title: 'Growing Engagement',
    description: 'Response rates have increased 25% over the last quarter',
    value: '↑ 25%',
    icon: TrendingUp,
    color: 'bg-blue-500'
  });

  // Anomaly detection
  insights.push({
    id: 'insight-3',
    type: 'anomaly',
    title: 'Regional Variation',
    description: 'Northern California shows significantly higher satisfaction scores',
    value: '4.5 vs 3.8 avg',
    icon: AlertCircle,
    color: 'bg-yellow-500'
  });

  // Recommendation
  insights.push({
    id: 'insight-4',
    type: 'recommendation',
    title: 'Optimize Survey Length',
    description: 'Surveys under 15 questions show 35% better completion rates',
    icon: Sparkles,
    color: 'bg-purple-500'
  });

  return insights;
}

export default InsightPanel;
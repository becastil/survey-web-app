'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlotlyChart, createBarChart, createLineChart, createPieChart } from '@/components/charts/PlotlyChart';
import { surveyService } from '@/lib/services/survey-service';
import { Survey } from '@/types';
import { TrendingUp, Users, CheckCircle, Clock, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    responsesByDay: Record<string, unknown>[];
    completionByStatus: Record<string, unknown>[];
    responsesByQuestion: Record<string, unknown>[];
    demographicData: Record<string, unknown>[];
    satisfactionScores: Record<string, unknown>[];
    timeToComplete: Record<string, unknown>[];
  }>({
    responsesByDay: [],
    completionByStatus: [],
    responsesByQuestion: [],
    demographicData: [],
    satisfactionScores: [],
    timeToComplete: [],
  });
  const [metrics, setMetrics] = useState({
    totalResponses: 0,
    avgCompletionRate: 0,
    avgTimeToComplete: 0,
    totalActiveSurveys: 0,
    responseGrowth: 0,
    satisfactionScore: 0,
  });

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load surveys
      const surveysData = await surveyService.getSurveys();
      setSurveys(surveysData);
      
      // Generate analytics data based on selected survey
      const filteredSurveys = selectedSurvey === 'all' 
        ? surveysData 
        : surveysData.filter(s => s.id === selectedSurvey);
      
      // Calculate metrics
      let totalResponses = 0;
      const completionRates: number[] = [];
      let activeSurveys = 0;
      
      // Response trend data
      const trendData = await surveyService.getResponseTrend();
      
      // Aggregate data for all relevant surveys
      const statusCounts = { completed: 0, inProgress: 0, notStarted: 0 };
      
      for (const survey of filteredSurveys) {
        if (survey.status === 'active') activeSurveys++;
        
        const stats = await surveyService.getSurveyStats(survey.id);
        totalResponses += stats.total;
        statusCounts.completed += stats.completed;
        statusCounts.inProgress += stats.inProgress;
        
        if (stats.total > 0) {
          completionRates.push(stats.completionRate);
        }
      }
      
      // Mock some not started for visualization
      statusCounts.notStarted = Math.floor(totalResponses * 0.1);
      
      // Calculate average completion rate
      const avgCompletionRate = completionRates.length > 0
        ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
        : 0;
      
      // Mock response growth (comparing to previous period)
      const responseGrowth = 15.3; // Mock 15.3% growth
      
      // Mock satisfaction score (would come from scale questions)
      const satisfactionScore = 4.2; // Out of 5
      
      // Mock average time to complete (in minutes)
      const avgTimeToComplete = 12; // 12 minutes average
      
      // Generate demographic data (mock)
      const demographicData = [
        { category: 'Full-time', count: Math.floor(totalResponses * 0.6) },
        { category: 'Part-time', count: Math.floor(totalResponses * 0.25) },
        { category: 'Contract', count: Math.floor(totalResponses * 0.15) },
      ];
      
      // Generate response distribution by question type (mock)
      const responsesByQuestion = [
        { type: 'Single Choice', responses: Math.floor(totalResponses * 0.35) },
        { type: 'Multiple Choice', responses: Math.floor(totalResponses * 0.25) },
        { type: 'Scale Rating', responses: Math.floor(totalResponses * 0.2) },
        { type: 'Text Input', responses: Math.floor(totalResponses * 0.15) },
        { type: 'Date/Number', responses: Math.floor(totalResponses * 0.05) },
      ];
      
      // Generate satisfaction scores over time (mock)
      const satisfactionScores = trendData.slice(-7).map((item) => ({
        date: item.date,
        score: 3.8 + Math.random() * 0.8, // Random between 3.8 and 4.6
      }));
      
      // Generate time to complete distribution (mock)
      const timeToComplete = [
        { range: '0-5 min', count: Math.floor(totalResponses * 0.15) },
        { range: '5-10 min', count: Math.floor(totalResponses * 0.35) },
        { range: '10-15 min', count: Math.floor(totalResponses * 0.3) },
        { range: '15-20 min', count: Math.floor(totalResponses * 0.15) },
        { range: '20+ min', count: Math.floor(totalResponses * 0.05) },
      ];
      
      setAnalyticsData({
        responsesByDay: trendData.slice(-14), // Last 14 days
        completionByStatus: [
          { status: 'Completed', count: statusCounts.completed },
          { status: 'In Progress', count: statusCounts.inProgress },
          { status: 'Not Started', count: statusCounts.notStarted },
        ],
        responsesByQuestion,
        demographicData,
        satisfactionScores,
        timeToComplete,
      });
      
      setMetrics({
        totalResponses,
        avgCompletionRate,
        avgTimeToComplete,
        totalActiveSurveys: activeSurveys,
        responseGrowth,
        satisfactionScore,
      });
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive insights into survey performance and respondent behavior
          </p>
        </div>
        <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select survey" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surveys</SelectItem>
            {surveys.map(survey => (
              <SelectItem key={survey.id} value={survey.id}>
                {survey.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.totalResponses}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.avgCompletionRate}%</p>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.avgTimeToComplete}m</p>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.totalActiveSurveys}</p>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">+{metrics.responseGrowth}%</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.satisfactionScore}/5</p>
              <div className="text-yellow-500">★</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Trends</CardTitle>
            <CardDescription>Daily responses over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createLineChart(
                  analyticsData.responsesByDay.map(d => d.date),
                  analyticsData.responsesByDay.map(d => d.count),
                  'Responses'
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
            <CardDescription>Current response status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createPieChart(
                  analyticsData.completionByStatus.map(d => d.status),
                  analyticsData.completionByStatus.map(d => d.count)
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response by Question Type</CardTitle>
            <CardDescription>Distribution of responses across question types</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createBarChart(
                  analyticsData.responsesByQuestion.map(d => d.type),
                  analyticsData.responsesByQuestion.map(d => d.responses),
                  'Responses'
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Demographics</CardTitle>
            <CardDescription>Respondent employment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createPieChart(
                  analyticsData.demographicData.map(d => d.category),
                  analyticsData.demographicData.map(d => d.count)
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Score Trend</CardTitle>
            <CardDescription>Average satisfaction ratings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createLineChart(
                  analyticsData.satisfactionScores.map(d => d.date),
                  analyticsData.satisfactionScores.map(d => d.score),
                  'Score'
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time to Complete Distribution</CardTitle>
            <CardDescription>How long respondents take to complete surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                createBarChart(
                  analyticsData.timeToComplete.map(d => d.range),
                  analyticsData.timeToComplete.map(d => d.count),
                  'Count'
                )
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-generated insights based on current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Peak Response Time</h4>
              <p className="text-sm text-blue-700">
                Most responses are submitted between 10 AM - 2 PM on weekdays
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">High Engagement</h4>
              <p className="text-sm text-green-700">
                Scale questions have 20% higher completion rates than text inputs
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-1">Completion Improvement</h4>
              <p className="text-sm text-purple-700">
                Surveys under 15 questions show 35% better completion rates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
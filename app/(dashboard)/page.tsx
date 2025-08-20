'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { surveyService } from '@/lib/services/survey-service';
import { Survey } from '@/types';

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responseData, setResponseData] = useState<Record<string, unknown>[]>([]);
  const [completionData, setCompletionData] = useState<Record<string, unknown>[]>([]);
  const [surveyData, setSurveyData] = useState<Record<string, unknown>[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load surveys
      const surveysData = await surveyService.getSurveys();
      setSurveys(surveysData);
      
      // Load response trend
      const trend = await surveyService.getResponseTrend();
      setResponseData(trend.slice(-6)); // Last 6 data points
      
      // Calculate completion stats
      let totalComp = 0;
      let totalInProg = 0;
      let totalNotStarted = 0;
      let totalResp = 0;
      const completionRates: number[] = [];
      const surveyStats: Record<string, unknown>[] = [];
      
      for (const survey of surveysData.filter(s => s.status !== 'draft')) {
        const stats = await surveyService.getSurveyStats(survey.id);
        totalComp += stats.completed;
        totalInProg += stats.inProgress;
        totalResp += stats.total;
        if (stats.total > 0) {
          completionRates.push(stats.completionRate);
        }
        
        // Add to survey performance data
        if (stats.total > 0) {
          surveyStats.push({
            survey: survey.title.length > 20 
              ? survey.title.substring(0, 20) + '...' 
              : survey.title,
            responses: stats.total,
          });
        }
      }
      
      // Calculate not started (this would normally come from invited users - responses)
      totalNotStarted = Math.floor(totalResp * 0.1); // Mock calculation
      
      setCompletionData([
        { status: 'Completed', count: totalComp },
        { status: 'In Progress', count: totalInProg },
        { status: 'Not Started', count: totalNotStarted },
      ]);
      
      setSurveyData(surveyStats.slice(0, 4)); // Top 4 surveys
      setTotalResponses(totalResp);
      setAvgCompletion(
        completionRates.length > 0 
          ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
          : 0
      );
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const activeSurveys = surveys.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Dashboard Overview</h2>
        <p className="mt-2 text-sm text-gray-600">
          Monitor survey responses and analyze healthcare benefits data
        </p>
      </div>

      {/* Info Banner for Demo Mode */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> This application is using mock data. You can interact with all features - create surveys, view analytics, and explore the interface. Changes are saved locally in your browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Surveys</CardTitle>
            <CardDescription>Active survey campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSurveys} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
            <CardDescription>Across all surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{Math.floor(totalResponses * 0.15)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Average across all surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Trends</CardTitle>
            <CardDescription>Daily survey responses</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={responseData}
              xField="date"
              yField="count"
              width={450}
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
            <CardDescription>Current survey status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart
              data={completionData}
              categoryField="status"
              valueField="count"
              width={450}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {surveyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Survey Performance</CardTitle>
            <CardDescription>Response count by survey</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={surveyData}
              xField="survey"
              yField="responses"
              width={900}
              height={250}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Try out the survey features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/surveys'}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium">View Surveys</h4>
              <p className="text-sm text-gray-600 mt-1">Browse and manage all surveys</p>
            </button>
            <button
              onClick={() => window.location.href = '/surveys/survey-1/respond'}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium">Take a Survey</h4>
              <p className="text-sm text-gray-600 mt-1">Experience the respondent view</p>
            </button>
            <button
              onClick={() => window.location.href = '/analytics'}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium">View Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">Explore detailed insights</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
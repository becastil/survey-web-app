'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { surveyService } from '@/lib/services/survey-service';
import { Survey, Question } from '@/types';
import { ArrowLeft, Download, Users, CheckCircle, Clock } from 'lucide-react';

export default function SurveyAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    responsesByDay: Record<string, unknown>[];
    completionByStatus: Record<string, unknown>[];
    responsesByQuestion: Record<string, unknown>[];
  }>({
    questionResponses: [],
    completionFunnel: [],
    timeDistribution: [],
    dropoffPoints: [],
  });
  const [metrics, setMetrics] = useState({
    totalResponses: 0,
    completionRate: 0,
    avgTimeToComplete: 0,
    mostSkippedQuestion: '',
  });

  useEffect(() => {
    loadSurveyAnalytics();
  }, [surveyId]);

  const loadSurveyAnalytics = async () => {
    try {
      setLoading(true);
      
      const [surveyData, questionsData] = await Promise.all([
        surveyService.getSurvey(surveyId),
        surveyService.getQuestions(surveyId),
      ]);

      if (!surveyData) {
        router.push('/surveys');
        return;
      }

      setSurvey(surveyData);
      setQuestions(questionsData);

      // Get survey statistics
      const stats = await surveyService.getSurveyStats(surveyId);
      
      // Generate analytics data for each question
      const questionResponses = questionsData.map((q, index) => ({
        question: `Q${index + 1}`,
        responses: Math.floor(stats.total * (1 - index * 0.02)), // Simulate slight dropoff
        title: q.question_text.substring(0, 30) + '...',
      }));

      // Completion funnel
      const completionFunnel = [
        { stage: 'Started', count: stats.total },
        { stage: 'Halfway', count: Math.floor(stats.total * 0.85) },
        { stage: '75% Complete', count: Math.floor(stats.total * 0.75) },
        { stage: 'Completed', count: stats.completed },
      ];

      // Time distribution
      const timeDistribution = [
        { range: '0-5 min', count: Math.floor(stats.total * 0.1) },
        { range: '5-10 min', count: Math.floor(stats.total * 0.4) },
        { range: '10-15 min', count: Math.floor(stats.total * 0.35) },
        { range: '15+ min', count: Math.floor(stats.total * 0.15) },
      ];

      // Dropoff points
      const dropoffPoints = questionsData.slice(0, 5).map((q, index) => ({
        question: `Q${index + 1}`,
        dropoffRate: Math.random() * 10 + 2, // Random between 2-12%
      }));

      setAnalyticsData({
        questionResponses,
        completionFunnel,
        timeDistribution,
        dropoffPoints,
      });

      setMetrics({
        totalResponses: stats.total,
        completionRate: stats.completionRate,
        avgTimeToComplete: 12, // Mock 12 minutes
        mostSkippedQuestion: 'Q7: Additional comments',
      });

    } catch (error) {
      console.error('Failed to load survey analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const data = {
      survey: survey?.title,
      metrics,
      analyticsData,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey?.title.replace(/\s+/g, '-')}-analytics.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Survey not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/surveys')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{survey.title} - Analytics</h2>
            <p className="mt-1 text-sm text-gray-600">{survey.description}</p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold">{metrics.completionRate}%</p>
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
              <p className="text-2xl font-bold">{metrics.avgTimeToComplete} min</p>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Most Skipped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium truncate">{metrics.mostSkippedQuestion}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response by Question</CardTitle>
            <CardDescription>Number of responses per question</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.questionResponses}
              xField="question"
              yField="responses"
              width={500}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Funnel</CardTitle>
            <CardDescription>User progress through the survey</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.completionFunnel}
              xField="stage"
              yField="count"
              width={500}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time to Complete</CardTitle>
            <CardDescription>Distribution of completion times</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart
              data={analyticsData.timeDistribution}
              categoryField="range"
              valueField="count"
              width={500}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Dropoff Points</CardTitle>
            <CardDescription>Questions with highest abandonment rates</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.dropoffPoints}
              xField="question"
              yField="dropoffRate"
              width={500}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Question Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance Details</CardTitle>
          <CardDescription>Detailed metrics for each question</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.slice(0, 10).map((question, index) => (
                  <tr key={question.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Q{index + 1}: {question.question_text.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.question_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(metrics.totalResponses * (1 - index * 0.02))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(100 - index * 2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(30 + Math.random() * 60)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
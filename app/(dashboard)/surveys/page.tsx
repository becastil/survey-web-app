'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { surveyService } from '@/lib/services/survey-service';
import { Survey } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Edit, Archive, BarChart, Users, Calendar, Filter } from 'lucide-react';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<{ [key: string]: { total: number; completed: number; inProgress: number; completionRate: number } }>({});
  const router = useRouter();

  useEffect(() => {
    loadSurveys();
  }, []);

  const filterSurveys = useCallback(() => {
    let filtered = [...surveys];
    
    if (searchTerm) {
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }
    
    setFilteredSurveys(filtered);
  }, [surveys, searchTerm, statusFilter]);

  const loadStats = useCallback(async () => {
    const newStats: { [key: string]: unknown } = {};
    for (const survey of surveys) {
      try {
        const surveyStats = await surveyService.getSurveyStats(survey.id);
        newStats[survey.id] = surveyStats;
      } catch (error) {
        console.error(`Failed to load stats for survey ${survey.id}:`, error);
      }
    }
    setStats(newStats);
  }, [surveys]);

  useEffect(() => {
    filterSurveys();
    loadStats();
  }, [filterSurveys, loadStats]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyService.getSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleArchive = async (surveyId: string) => {
    try {
      await surveyService.updateSurvey(surveyId, { status: 'archived' });
      await loadSurveys();
    } catch (error) {
      console.error('Failed to archive survey:', error);
    }
  };

  const getStatusBadge = (status: Survey['status']) => {
    const variants: Record<Survey['status'], { color: string; text: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
      archived: { color: 'bg-yellow-100 text-yellow-800', text: 'Archived' },
    };

    const variant = variants[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.color}`}>
        {variant.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading surveys...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Surveys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all healthcare benefit surveys
          </p>
        </div>
        <Button
          onClick={() => router.push('/surveys/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Survey
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surveys</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Survey Cards */}
      <div className="grid gap-4">
        {filteredSurveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No surveys found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {survey.title}
                      </h3>
                      {getStatusBadge(survey.status)}
                    </div>
                    <p className="text-gray-600 mb-4">{survey.description}</p>
                    
                    <div className="flex gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{stats[survey.id]?.total || 0} responses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart className="h-4 w-4" />
                        <span>{stats[survey.id]?.completionRate || 0}% completion</span>
                      </div>
                      {survey.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Ends {formatDate(survey.end_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/surveys/${survey.id}/analytics`)}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/surveys/${survey.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {survey.status !== 'archived' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(survey.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{surveys.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {surveys.filter(s => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Object.values(stats).reduce((sum: number, stat) => sum + (stat?.total || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {surveys.length > 0 
                ? Math.round(
                    Object.values(stats).reduce((sum: number, stat) => sum + (stat?.completionRate || 0), 0) / 
                    Object.values(stats).length
                  )
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
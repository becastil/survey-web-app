'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RegionalDistributionMap } from '@/components/exhibits/RegionalDistributionMap';
import { PercentileRankingCard } from '@/components/exhibits/PercentileRankingCard';
import { CompanyHistogram } from '@/components/exhibits/CompanyHistogram';
import { 
  Upload, 
  Download, 
  Filter, 
  RefreshCw,
  TrendingUp,
  Users,
  Building,
  DollarSign
} from 'lucide-react';

// Mock data for demonstration
const mockRegionalData = [
  { region: 'Southern California', count: 18, percentage: 45 },
  { region: 'San Francisco Bay Area', count: 8, percentage: 20 },
  { region: 'Rural California', count: 7, percentage: 18 },
  { region: 'Sacramento Region', count: 4, percentage: 10 },
  { region: 'San Diego', count: 3, percentage: 8 },
];

const mockSizeData = [
  { range: '1-50', count: 5, percentage: 12.5 },
  { range: '51-200', count: 12, percentage: 30 },
  { range: '201-500', count: 8, percentage: 20 },
  { range: '501-1000', count: 7, percentage: 17.5 },
  { range: '1001-5000', count: 5, percentage: 12.5 },
  { range: '5000+', count: 3, percentage: 7.5 },
];

export default function SurveyDashboard() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Survey Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive benchmarking analysis for 40 organizations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">40</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Company Size</CardTitle>
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">450</p>
            <p className="text-xs text-muted-foreground">employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$45M</p>
            <p className="text-xs text-muted-foreground">annual revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualizations */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RegionalDistributionMap
              data={mockRegionalData}
              title="Geographic Distribution"
              description="Survey responses by region"
            />
            <CompanyHistogram
              data={mockSizeData}
              mean={450}
              median={380}
              yourPosition="201-500"
              title="Organization Size Distribution"
            />
          </div>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PercentileRankingCard
              metric="Employee Benefits Score"
              value={85}
              percentile={78}
              trend="up"
              trendValue={5}
              benchmark={65}
              category="Human Resources"
            />
            <PercentileRankingCard
              metric="Compensation Index"
              value={102000}
              percentile={65}
              trend="stable"
              trendValue={0}
              benchmark={70}
              category="Compensation"
            />
            <PercentileRankingCard
              metric="Retention Rate"
              value={92}
              percentile={88}
              trend="up"
              trendValue={3}
              benchmark={75}
              category="HR Metrics"
            />
            <PercentileRankingCard
              metric="Training Budget"
              value={5000}
              percentile={45}
              trend="down"
              trendValue={-2}
              benchmark={60}
              category="Development"
            />
            <PercentileRankingCard
              metric="PTO Days"
              value={22}
              percentile={72}
              trend="up"
              trendValue={1}
              benchmark={70}
              category="Benefits"
            />
            <PercentileRankingCard
              metric="Remote Work Score"
              value={75}
              percentile={82}
              trend="up"
              trendValue={15}
              benchmark={65}
              category="Work Environment"
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Year-over-year comparisons and projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Trend visualizations will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Key findings and recommendations from your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                <p className="font-semibold text-emerald-900">Strong Performance</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Your retention rate (92%) ranks in the 88th percentile, significantly above industry average.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                <p className="font-semibold text-amber-900">Opportunity Area</p>
                <p className="text-sm text-amber-700 mt-1">
                  Training budget per employee ($5,000) is below the 50th percentile. Consider increasing investment.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-semibold text-blue-900">Market Trend</p>
                <p className="text-sm text-blue-700 mt-1">
                  Remote work flexibility scores have increased 15% year-over-year across all respondents.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Last updated: {lastUpdated.toLocaleString()}</span>
        <span>Survey Year: 2024</span>
      </div>
    </div>
  );
}
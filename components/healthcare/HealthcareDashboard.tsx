'use client';
import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin,
  FileText,
  Download,
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedFileUploadZone, UploadedFile } from '@/components/upload/EnhancedFileUploadZone';
import { HealthcareDataParser, HealthcareSurveyData } from '@/lib/parsers/healthcareDataParser';

import { 
  PlotlyChart, 
  createBarChart, 
  createPieChart, 
  createScatterChart,
  createBoxPlot 
} from '@/components/charts/PlotlyChart';

interface ChartData {
  regional: any;
  planComparison: any;
  costAnalysis: any;
  trendAnalysis: any;
  demographics: any;
}

export function HealthcareDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [surveyData, setSurveyData] = useState<HealthcareSurveyData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Process uploaded files
  const handleFilesProcessed = useCallback(async (files: UploadedFile[]) => {
    setIsProcessing(true);
    
    try {
      const allData: any[] = [];
      
      for (const uploadedFile of files) {
        if (uploadedFile.status === 'success') {
          const parsed = await HealthcareDataParser.parseFile(uploadedFile.file);
          allData.push(...parsed.data);
        }
      }
      
      // Transform to healthcare survey format
      const transformed = HealthcareDataParser.transformToHealthcareSurvey(
        allData,
        allData.length > 0 ? Object.keys(allData[0]) : []
      );
      
      setRawData(allData);
      setSurveyData(transformed);
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (surveyData.length === 0) return null;
    
    const filteredData = surveyData.filter(d => 
      (selectedRegion === 'all' || d.region === selectedRegion)
    );
    
    return {
      totalOrganizations: filteredData.length,
      totalEmployees: filteredData.reduce((sum, d) => sum + d.employeeCount, 0),
      averageBudgetIncrease: 
        filteredData.reduce((sum, d) => sum + (d.benefitBudgetIncrease || 0), 0) / filteredData.length,
      regions: [...new Set(filteredData.map(d => d.region))],
      unionPercentage: 
        (filteredData.filter(d => d.unionPopulation).length / filteredData.length) * 100
    };
  }, [surveyData, selectedRegion]);

  // Generate chart data
  const chartData = useMemo((): ChartData => {
    if (surveyData.length === 0) {
      return {
        regional: null,
        planComparison: null,
        costAnalysis: null,
        trendAnalysis: null,
        demographics: null
      };
    }
    
    const filteredData = surveyData.filter(d => 
      (selectedRegion === 'all' || d.region === selectedRegion)
    );
    
    // Regional Distribution
    const regionCounts = filteredData.reduce((acc, d) => {
      acc[d.region] = (acc[d.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const regional = {
      x: Object.keys(regionCounts),
      y: Object.values(regionCounts),
      type: 'bar',
      marker: {
        color: Object.values(regionCounts).map((_, i) => 
          `hsl(${210 + i * 30}, 70%, 50%)`
        ),
        line: { color: 'white', width: 2 }
      },
      text: Object.values(regionCounts).map(v => v.toString()),
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Organizations: %{y}<extra></extra>'
    };
    
    // Plan Type Comparison
    const planTypes = ['HMO', 'PPO', 'EPO', 'HDHP'];
    const planCounts = planTypes.map(type => 
      filteredData.filter(d => 
        d.medicalPlans?.some(p => p.planType === type)
      ).length
    );
    
    const planComparison = {
      labels: planTypes,
      values: planCounts,
      type: 'pie',
      hole: 0.4,
      marker: {
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        line: { color: 'white', width: 2 }
      },
      textinfo: 'label+percent',
      hovertemplate: '<b>%{label}</b><br>%{value} organizations<br>%{percent}<extra></extra>'
    };
    
    // Cost Analysis Scatter
    const costAnalysis = {
      x: filteredData.map(d => d.employeeCount),
      y: filteredData.map(d => d.benefitBudgetIncrease || 0),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: filteredData.map(d => Math.log(d.employeeCount + 1) * 3),
        color: filteredData.map(d => d.unionPopulation ? '#EF4444' : '#3B82F6'),
        opacity: 0.6,
        line: { color: 'white', width: 1 }
      },
      text: filteredData.map(d => d.organizationName),
      hovertemplate: 
        '<b>%{text}</b><br>' +
        'Employees: %{x}<br>' +
        'Budget Increase: %{y}%<extra></extra>'
    };
    
    // Trend Analysis (Mock time series)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendAnalysis = {
      x: months,
      y: months.map((_, i) => 
        summaryStats?.averageBudgetIncrease + Math.random() * 2 - 1
      ),
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: '#8B5CF6',
        width: 3,
        shape: 'spline'
      },
      marker: {
        color: '#8B5CF6',
        size: 8,
        line: { color: 'white', width: 2 }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(139, 92, 246, 0.1)',
      hovertemplate: '<b>%{x}</b><br>Budget Increase: %{y:.1f}%<extra></extra>'
    };
    
    // Demographics
    const demographics = {
      type: 'box',
      y: filteredData.map(d => d.employeeCount),
      name: 'Employee Count Distribution',
      marker: { color: '#10B981' },
      boxmean: 'sd'
    };
    
    return {
      regional,
      planComparison,
      costAnalysis,
      trendAnalysis,
      demographics
    };
  }, [surveyData, selectedRegion, summaryStats]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Healthcare Survey Analytics</h1>
          <p className="text-muted-foreground">
            Upload and analyze healthcare survey data with interactive visualizations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* File Upload Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Data Upload</CardTitle>
            <CardDescription>
              Upload CSV, Excel, or PDF files containing healthcare survey data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedFileUploadZone
              onFilesProcessed={handleFilesProcessed}
              acceptedFormats={['csv', 'xlsx', 'xls', 'pdf']}
              maxFiles={10}
              maxFileSize={50}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Statistics */}
      <AnimatePresence>
        {summaryStats && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          >
            {[
              {
                label: 'Organizations',
                value: summaryStats.totalOrganizations,
                icon: Users,
                color: 'blue',
                change: '+12%'
              },
              {
                label: 'Total Employees',
                value: summaryStats.totalEmployees.toLocaleString(),
                icon: Users,
                color: 'green',
                change: '+8%'
              },
              {
                label: 'Avg Budget Increase',
                value: `${summaryStats.averageBudgetIncrease.toFixed(1)}%`,
                icon: TrendingUp,
                color: 'purple',
                change: '+2.5%'
              },
              {
                label: 'Regions',
                value: summaryStats.regions.length,
                icon: MapPin,
                color: 'orange',
                change: '0'
              },
              {
                label: 'Union Coverage',
                value: `${summaryStats.unionPercentage.toFixed(0)}%`,
                icon: FileText,
                color: 'red',
                change: '-1%'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className={`text-xs mt-1 ${
                          stat.change.startsWith('+') ? 'text-green-600' : 
                          stat.change.startsWith('-') ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {stat.change} from last period
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <AnimatePresence>
        {surveyData.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex gap-4"
          >
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {summaryStats?.regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plan Types</SelectItem>
                <SelectItem value="HMO">HMO</SelectItem>
                <SelectItem value="PPO">PPO</SelectItem>
                <SelectItem value="EPO">EPO</SelectItem>
                <SelectItem value="HDHP">HDHP</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualizations */}
      <AnimatePresence>
        {chartData.regional && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="regional">Regional</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Plot
                        data={[chartData.regional]}
                        layout={{
                          height: 300,
                          margin: { t: 10, r: 10, b: 40, l: 40 },
                          xaxis: { title: 'Region' },
                          yaxis: { title: 'Organizations' },
                          paper_bgcolor: 'rgba(0,0,0,0)',
                          plot_bgcolor: 'rgba(0,0,0,0)'
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Plot
                        data={[chartData.planComparison]}
                        layout={{
                          height: 300,
                          margin: { t: 10, r: 10, b: 10, l: 10 },
                          showlegend: true,
                          paper_bgcolor: 'rgba(0,0,0,0)',
                          plot_bgcolor: 'rgba(0,0,0,0)'
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="regional">
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Analysis</CardTitle>
                    <CardDescription>
                      Organization distribution across geographic regions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Plot
                      data={[chartData.regional]}
                      layout={{
                        height: 400,
                        margin: { t: 20, r: 20, b: 60, l: 60 },
                        xaxis: { title: 'Region' },
                        yaxis: { title: 'Number of Organizations' },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        hoverlabel: {
                          bgcolor: 'white',
                          font: { size: 13 }
                        }
                      }}
                      config={{ responsive: true, displaylogo: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Plan Analysis</CardTitle>
                    <CardDescription>
                      Distribution of medical plan types across organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Plot
                      data={[chartData.planComparison]}
                      layout={{
                        height: 400,
                        margin: { t: 20, r: 100, b: 20, l: 100 },
                        showlegend: true,
                        legend: {
                          orientation: 'v',
                          x: 1.1,
                          y: 0.5
                        },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)'
                      }}
                      config={{ responsive: true, displaylogo: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                    <CardDescription>
                      Relationship between organization size and budget increases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Plot
                      data={[chartData.costAnalysis]}
                      layout={{
                        height: 400,
                        margin: { t: 20, r: 20, b: 60, l: 60 },
                        xaxis: { 
                          title: 'Employee Count',
                          type: 'log'
                        },
                        yaxis: { title: 'Budget Increase (%)' },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        hoverlabel: {
                          bgcolor: 'white',
                          font: { size: 13 }
                        }
                      }}
                      config={{ responsive: true, displaylogo: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                    <CardDescription>
                      Budget increase trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Plot
                      data={[chartData.trendAnalysis]}
                      layout={{
                        height: 400,
                        margin: { t: 20, r: 20, b: 60, l: 60 },
                        xaxis: { title: 'Month' },
                        yaxis: { title: 'Average Budget Increase (%)' },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        hoverlabel: {
                          bgcolor: 'white',
                          font: { size: 13 }
                        }
                      }}
                      config={{ responsive: true, displaylogo: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {surveyData.length === 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No data yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Upload healthcare survey files to start analyzing and visualizing your data
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
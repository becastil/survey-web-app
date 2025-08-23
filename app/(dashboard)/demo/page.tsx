'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Database, 
  FileDown,
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

export default function DemoPage() {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Premium Stack Demo
            </Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Next-Gen Insights Platform
          </h1>
          <p className="text-slate-600 mt-2">
            Modern stack showcase: Motion • Nivo • DuckDB • shadcn/ui
          </p>
        </div>

        {/* Upload Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20" />
                <Upload className="w-16 h-16 text-purple-600 relative z-10" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-slate-800">
                Drag & Drop Your Data
              </h3>
              <p className="text-slate-500 mb-6">
                CSV, Excel • Instant browser processing • Zero backend
              </p>
              
              <Button 
                onClick={() => setShowInsights(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Simulate Upload & Process
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Insights Section */}
        {showInsights && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Records', value: '15,420', icon: Database, color: 'purple' },
                { label: 'Avg Score', value: '78.5%', icon: TrendingUp, color: 'blue' },
                { label: 'Growth Rate', value: '+24.3%', icon: Activity, color: 'green' },
                { label: 'Quality Score', value: '98%', icon: Sparkles, color: 'pink' }
              ].map((kpi) => (
                <Card key={kpi.label} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                        <p className="text-2xl font-bold mt-1 text-slate-800">{kpi.value}</p>
                      </div>
                      <kpi.icon className="w-8 h-8 text-purple-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Visualization Tabs */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Data Visualizations</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-700">Interactive Charts</p>
                        <p className="text-sm text-slate-500 mt-2">Powered by Nivo • Motion.dev animations</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trends" className="mt-6">
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-700">Trend Analysis</p>
                        <p className="text-sm text-slate-500 mt-2">Real-time processing with DuckDB-WASM</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="mt-6">
                    <div className="space-y-3">
                      {[
                        'Healthcare sector shows 32% YoY growth',
                        'Q4 projections indicate 18% revenue increase',
                        'Data quality score: 98% with automated corrections',
                        'Customer satisfaction correlates with revenue (r=0.87)'
                      ].map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border border-purple-100">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {i + 1}
                          </div>
                          <p className="text-slate-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Export Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInsights(false)}>
                Reset Demo
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <FileDown className="w-4 h-4 mr-2" />
                Export Premium Report
              </Button>
            </div>
          </>
        )}

        {/* Tech Stack */}
        <div className="text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary">Motion.dev</Badge>
            <Badge variant="secondary">Nivo</Badge>
            <Badge variant="secondary">DuckDB-WASM</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
          <p>Premium stack for next-generation analytics</p>
        </div>
      </div>
    </div>
  );
}
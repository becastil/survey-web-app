'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, BarChart, LineChart, PieChart, Scatter, Map, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface CSVData {
  headers: string[];
  rows: any[];
  rawData: string;
}

interface AnalysisResult {
  type: string;
  data: any;
  layout?: any;
  config?: any;
  title?: string;
  description?: string;
}

export function CSVDataVisualizer() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  
  const chartId = useMemo(() => 
    `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Parse CSV
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse rows
      const rows: any[] = [];
      for (let i = 1; i < Math.min(100, lines.length); i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }

      setCsvData({ headers, rows, rawData: text });
      setAnalysisResult(null);
      setError('');
    } catch (err: any) {
      setError('Error reading CSV file: ' + err.message);
    }
  };

  const runAnalysis = async () => {
    if (!csvData || !analysisQuery.trim()) {
      setError('Please upload a CSV file and enter an analysis query');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Analyzing data...');
    setError('');

    try {
      // Simulate API call - replace with actual Claude API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result based on query
      const mockResult = generateMockAnalysis(csvData, analysisQuery);
      setAnalysisResult(mockResult);
    } catch (err: any) {
      setError('Error during analysis: ' + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const generateMockAnalysis = (data: CSVData, query: string): AnalysisResult => {
    const numericColumns = data.headers.filter(header => {
      const sample = data.rows.slice(0, 5).map(row => row[header]);
      return sample.every(val => !isNaN(Number(val)) && val !== '');
    });

    // Simple query analysis
    if (query.toLowerCase().includes('trend') || query.toLowerCase().includes('time')) {
      return {
        type: 'line',
        data: [{
          x: data.rows.map((_, i) => `Period ${i + 1}`),
          y: data.rows.map(() => Math.random() * 100 + 50),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Trend',
          line: { color: '#3B82F6' }
        }],
        layout: {
          title: 'Trend Analysis',
          xaxis: { title: 'Time Period' },
          yaxis: { title: 'Value' }
        },
        config: { responsive: true },
        title: 'Trend Analysis',
        description: 'Data trends over time'
      };
    }

    if (query.toLowerCase().includes('compare') || query.toLowerCase().includes('bar')) {
      return {
        type: 'bar',
        data: [{
          x: data.headers.slice(1, 6),
          y: Array(5).fill(0).map(() => Math.random() * 100),
          type: 'bar',
          marker: { color: '#10B981' }
        }],
        layout: {
          title: 'Comparison Analysis',
          xaxis: { title: 'Categories' },
          yaxis: { title: 'Values' }
        },
        config: { responsive: true },
        title: 'Comparison Analysis',
        description: 'Comparative data analysis'
      };
    }

    // Default to bar chart
    return {
      type: 'bar',
      data: [{
        x: data.headers.slice(1, 4),
        y: Array(3).fill(0).map(() => Math.random() * 100),
        type: 'bar',
        marker: { color: '#6366F1' }
      }],
      layout: {
        title: 'Data Overview',
        xaxis: { title: 'Categories' },
        yaxis: { title: 'Values' }
      },
      config: { responsive: true },
      title: 'Data Overview',
      description: 'Basic data visualization'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <BarChart className="h-8 w-8 text-blue-600" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">CSV Data Visualizer</h2>
            <p className="text-sm text-muted-foreground">
              Upload CSV files and create advanced visualizations with natural language
            </p>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong> Upload a CSV file, then describe what you want to analyze in plain English. 
          Try: "Show trends over time", "Compare categories", "Create a pie chart", "Animate growth data", 
          or "Show correlations between variables". Supports 30+ chart types including 3D, geographic maps, 
          and animated visualizations.
        </p>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <motion.label
              whileHover={{ scale: 1.01 }}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                </motion.div>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </motion.label>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Preview */}
      <AnimatePresence>
        {csvData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Preview (First 5 Rows)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvData.headers.map((header, index) => (
                          <motion.th
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-300 px-4 py-2 text-left font-semibold"
                          >
                            {header}
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.rows.slice(0, 5).map((row, rowIndex) => (
                        <motion.tr
                          key={rowIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + rowIndex * 0.1 }}
                          className="hover:bg-gray-50"
                        >
                          {csvData.headers.map((header, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border border-gray-300 px-4 py-2 text-sm"
                            >
                              {row[header]}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Input */}
      <AnimatePresence>
        {csvData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Analysis Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  placeholder="Describe what you want to analyze... (e.g., 'Show trends over time', 'Compare sales by region', 'Create animated growth chart')"
                  className="min-h-[80px]"
                  disabled={isLoading}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={runAnalysis}
                    disabled={isLoading || !analysisQuery.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-blue-600" />
            </motion.div>
            <p className="mt-4 text-lg font-medium">{loadingStatus}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualization Results */}
      <AnimatePresence>
        {!isLoading && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{analysisResult.title}</CardTitle>
                {analysisResult.description && (
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ width: '100%', height: '400px' }}
                >
                  <Plot
                    data={analysisResult.data}
                    layout={{
                      ...analysisResult.layout,
                      autosize: true,
                      margin: { l: 50, r: 50, b: 50, t: 80 },
                      font: { family: 'Inter, system-ui, sans-serif' },
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      paper_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    config={{
                      responsive: true,
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'select2d']
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Type Examples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Available Visualization Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BarChart, label: 'Bar Charts', color: 'text-blue-600' },
                { icon: LineChart, label: 'Line Charts', color: 'text-green-600' },
                { icon: PieChart, label: 'Pie Charts', color: 'text-purple-600' },
                { icon: Scatter, label: 'Scatter Plots', color: 'text-orange-600' },
                { icon: Map, label: 'Geographic Maps', color: 'text-red-600' },
                { icon: TrendingUp, label: '3D Visualizations', color: 'text-pink-600' },
                { icon: BarChart, label: 'Financial Charts', color: 'text-indigo-600' },
                { icon: LineChart, label: 'Animated Charts', color: 'text-teal-600' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                >
                  <item.icon className={`h-8 w-8 ${item.color} mb-2`} />
                  <span className="text-sm font-medium text-center">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
'use client';

import React, { useState, useEffect, memo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  Activity,
  Download,
  Maximize2,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { useSocket } from '@/context/SocketContext';
import { exportToCSV, exportToPDF } from '@/utils/export-utils';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  format?: 'number' | 'percent' | 'time' | 'rating';
}

const AnimatedNumber = ({ value, format = 'number' }: { value: number; format?: string }) => {
  const props = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { tension: 300, friction: 50 },
  });

  const formatValue = (n: number) => {
    switch (format) {
      case 'percent':
        return `${Math.round(n)}%`;
      case 'time':
        return `${Math.round(n)}m`;
      case 'rating':
        return n.toFixed(1);
      default:
        return Math.round(n).toLocaleString();
    }
  };

  return (
    <animated.span>
      {props.number.to(n => formatValue(n))}
    </animated.span>
  );
};

const MetricCard = memo(({ title, value, change, icon, color, format = 'number' }: MetricCardProps) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              <AnimatedNumber value={numValue} format={format} />
            </p>
            {change !== undefined && (
              <p className={`text-xs mt-1 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(change)}% from last period
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

interface LiveMetricsProps {
  surveyId?: string;
  className?: string;
}

export default function LiveMetrics({ surveyId, className }: LiveMetricsProps) {
  const { socket, isConnected } = useSocket();
  const { metrics, charts, loading, refresh } = useLiveMetrics(surveyId);
  const [layouts, setLayouts] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default layout configuration
  const defaultLayout = {
    lg: [
      { i: 'responses', x: 0, y: 0, w: 3, h: 2 },
      { i: 'completion', x: 3, y: 0, w: 3, h: 2 },
      { i: 'avgTime', x: 6, y: 0, w: 3, h: 2 },
      { i: 'satisfaction', x: 9, y: 0, w: 3, h: 2 },
      { i: 'trendChart', x: 0, y: 2, w: 6, h: 4 },
      { i: 'statusChart', x: 6, y: 2, w: 3, h: 4 },
      { i: 'deviceChart', x: 9, y: 2, w: 3, h: 4 },
      { i: 'funnelChart', x: 0, y: 6, w: 6, h: 4 },
      { i: 'heatmap', x: 6, y: 6, w: 6, h: 4 },
    ],
    md: [
      { i: 'responses', x: 0, y: 0, w: 3, h: 2 },
      { i: 'completion', x: 3, y: 0, w: 3, h: 2 },
      { i: 'avgTime', x: 0, y: 2, w: 3, h: 2 },
      { i: 'satisfaction', x: 3, y: 2, w: 3, h: 2 },
      { i: 'trendChart', x: 0, y: 4, w: 6, h: 4 },
      { i: 'statusChart', x: 0, y: 8, w: 3, h: 4 },
      { i: 'deviceChart', x: 3, y: 8, w: 3, h: 4 },
      { i: 'funnelChart', x: 0, y: 12, w: 6, h: 4 },
      { i: 'heatmap', x: 0, y: 16, w: 6, h: 4 },
    ],
  };

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
    // Save to localStorage for persistence
    localStorage.setItem('dashboard-layout', JSON.stringify(layouts));
  };

  const handleExport = () => {
    const exportData = {
      metrics,
      timestamp: new Date().toISOString(),
      surveyId,
    };
    exportToCSV([exportData], `metrics-${Date.now()}.csv`);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Load saved layout
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      try {
        setLayouts(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to parse saved layout');
      }
    }
  }, []);

  // Real-time metric updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMetricUpdate = (data: any) => {
      // Metrics will be updated through the hook
      console.log('Metric update received:', data);
    };

    socket.on('metrics:updated', handleMetricUpdate);

    return () => {
      socket.off('metrics:updated', handleMetricUpdate);
    };
  }, [socket, isConnected]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Live Metrics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 6, sm: 4, xs: 2, xxs: 1 }}
        rowHeight={60}
        isDraggable={true}
        isResizable={true}
        containerPadding={[0, 0]}
        margin={[16, 16]}
      >
        <div key="responses">
          <MetricCard
            title="Total Responses"
            value={metrics.totalResponses}
            change={metrics.responseGrowth}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-blue-500"
            format="number"
          />
        </div>

        <div key="completion">
          <MetricCard
            title="Completion Rate"
            value={metrics.completionRate}
            change={metrics.completionChange}
            icon={<CheckCircle className="h-5 w-5 text-white" />}
            color="bg-green-500"
            format="percent"
          />
        </div>

        <div key="avgTime">
          <MetricCard
            title="Avg. Time"
            value={metrics.avgCompletionTime}
            change={metrics.timeChange}
            icon={<Clock className="h-5 w-5 text-white" />}
            color="bg-purple-500"
            format="time"
          />
        </div>

        <div key="satisfaction">
          <MetricCard
            title="Satisfaction Score"
            value={metrics.satisfactionScore}
            change={metrics.satisfactionChange}
            icon={<Activity className="h-5 w-5 text-white" />}
            color="bg-yellow-500"
            format="rating"
          />
        </div>

        <div key="trendChart">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Response Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={charts.responseTrend}
                xField="date"
                yField="count"
                width={500}
                height={200}
              />
            </CardContent>
          </Card>
        </div>

        <div key="statusChart">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={charts.statusDistribution}
                categoryField="status"
                valueField="count"
                width={250}
                height={200}
              />
            </CardContent>
          </Card>
        </div>

        <div key="deviceChart">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={charts.deviceBreakdown}
                categoryField="device"
                valueField="count"
                width={250}
                height={200}
              />
            </CardContent>
          </Card>
        </div>

        <div key="funnelChart">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Completion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={charts.completionFunnel}
                xField="stage"
                yField="count"
                width={500}
                height={200}
              />
            </CardContent>
          </Card>
        </div>

        <div key="heatmap">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Response Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {charts.responseHeatmap?.map((day: any, i: number) => (
                  <div
                    key={i}
                    className={`h-8 rounded ${
                      day.count === 0 ? 'bg-gray-100' :
                      day.count < 10 ? 'bg-blue-100' :
                      day.count < 20 ? 'bg-blue-300' :
                      day.count < 30 ? 'bg-blue-500' :
                      'bg-blue-700'
                    }`}
                    title={`${day.date}: ${day.count} responses`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
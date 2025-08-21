'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, TrendingUp, Database, BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CSVDataVisualizer } from '@/components/analytics/CSVDataVisualizer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function CSVAnalyticsPage() {
  return (
    <motion.div 
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CSV Data Analytics</h1>
            <p className="text-muted-foreground">
              Upload and analyze survey data with advanced visualizations
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Sample Data
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Card className="p-6">
            <div className="flex items-center">
              <motion.div
                className="p-2 bg-blue-100 rounded-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Database className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  35
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Card className="p-6">
            <div className="flex items-center">
              <motion.div
                className="p-2 bg-green-100 rounded-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Analysis Types</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  30+
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Card className="p-6">
            <div className="flex items-center">
              <motion.div
                className="p-2 bg-purple-100 rounded-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Chart Types</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  25+
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main CSV Visualizer */}
      <motion.div variants={cardVariants}>
        <Card className="p-6">
          <CSVDataVisualizer />
        </Card>
      </motion.div>

      {/* Sample Data Templates */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Sample Healthcare Data Templates</CardTitle>
            <CardDescription>
              Try these healthcare-specific datasets to explore different visualization types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Patient Satisfaction",
                  description: "Monthly patient satisfaction scores by department",
                  icon: "📊",
                  filename: "patient_satisfaction.csv"
                },
                {
                  title: "Staff Metrics",
                  description: "Employee performance and retention data",
                  icon: "👥",
                  filename: "staff_metrics.csv"
                },
                {
                  title: "Financial Data", 
                  description: "Revenue trends and cost analysis",
                  icon: "💰",
                  filename: "financial_data.csv"
                },
                {
                  title: "Quality Metrics",
                  description: "Quality indicators and benchmarks",
                  icon: "⚕️",
                  filename: "quality_metrics.csv"
                }
              ].map((template, index) => (
                <motion.div
                  key={template.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <h3 className="font-semibold mb-1">{template.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Download Template
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  BarChart3, 
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Download,
  Play,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Papa from 'papaparse';
import { DataValidator } from '@/lib/services/data-validator';

// Sample healthcare survey data
const SAMPLE_CSV_DATA = `Region,Organization,Respondents,Satisfaction,Coverage,Premium
Northern California,Kaiser Permanente,245,4.2,Comprehensive,High
Southern California,Blue Shield,312,3.8,Standard,Medium
Bay Area,Sutter Health,189,4.5,Premium,High
Central Valley,Anthem,156,3.6,Basic,Low
San Diego,Sharp Healthcare,203,4.1,Comprehensive,Medium
Sacramento,UC Davis Health,178,4.3,Premium,High
Los Angeles,Cedars-Sinai,267,4.4,Comprehensive,High
Orange County,Hoag Health,198,4.0,Standard,Medium`;

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete';
}

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const steps: DemoStep[] = [
    {
      id: 'upload',
      title: 'Upload Survey Data',
      description: 'Drop your CSV file or use our sample data',
      icon: <Upload className="w-5 h-5" />,
      status: currentStep > 0 ? 'complete' : currentStep === 0 ? 'active' : 'pending',
    },
    {
      id: 'validate',
      title: 'Data Validation',
      description: 'Automatic quality scoring and cleaning',
      icon: <CheckCircle className="w-5 h-5" />,
      status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'active' : 'pending',
    },
    {
      id: 'transform',
      title: 'Transform & Analyze',
      description: 'Regional grouping and statistical analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'active' : 'pending',
    },
    {
      id: 'generate',
      title: 'Generate Report',
      description: 'Professional PDF with executive summary',
      icon: <FileText className="w-5 h-5" />,
      status: currentStep > 3 ? 'complete' : currentStep === 3 ? 'active' : 'pending',
    },
  ];

  const startDemo = async () => {
    setIsProcessing(true);
    setCurrentStep(0);

    // Step 1: Upload
    await simulateStep(1000);
    setCurrentStep(1);

    // Parse CSV data
    const parsed = Papa.parse(SAMPLE_CSV_DATA, { header: true });
    setDemoData(parsed.data);

    // Step 2: Validate
    await simulateStep(1500);
    const validationResult = DataValidator.scoreDataQuality(parsed.data);
    console.log('Validation score:', validationResult.score);
    setCurrentStep(2);

    // Step 3: Transform
    await simulateStep(1500);
    const transformed = transformData(parsed.data);
    setCurrentStep(3);

    // Step 4: Generate Report
    await simulateStep(2000);
    setReportPreview(generateReportPreview(transformed));
    setCurrentStep(4);
    
    setIsProcessing(false);
  };

  const simulateStep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const transformData = (data: any[]) => {
    // Group by region and calculate aggregates
    const regionGroups: Record<string, any[]> = {};
    data.forEach(row => {
      if (!regionGroups[row.Region]) {
        regionGroups[row.Region] = [];
      }
      regionGroups[row.Region].push(row);
    });

    const summary = Object.entries(regionGroups).map(([region, rows]) => ({
      region,
      totalRespondents: rows.reduce((sum, r) => sum + parseInt(r.Respondents || 0), 0),
      avgSatisfaction: (rows.reduce((sum, r) => sum + parseFloat(r.Satisfaction || 0), 0) / rows.length).toFixed(1),
      organizations: rows.length,
    }));

    return summary;
  };

  const generateReportPreview = (data: any[]) => {
    const totalRespondents = data.reduce((sum, d) => sum + d.totalRespondents, 0);
    const avgSatisfaction = (data.reduce((sum, d) => sum + parseFloat(d.avgSatisfaction), 0) / data.length).toFixed(1);
    
    return `
      Executive Summary
      ─────────────────
      Total Survey Respondents: ${totalRespondents.toLocaleString()}
      Regions Analyzed: ${data.length}
      Overall Satisfaction: ${avgSatisfaction}/5.0
      
      Regional Breakdown:
      ${data.map(d => `• ${d.region}: ${d.totalRespondents} respondents, ${d.avgSatisfaction}/5.0`).join('\n      ')}
    `;
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setDemoData(null);
    setReportPreview(null);
    setIsProcessing(false);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/5 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">Interactive Demo</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">
            <span className="text-white">See It In </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Action
            </span>
          </h2>
          <p className="text-lg text-gray-400 font-body max-w-2xl mx-auto">
            Experience the complete survey data transformation pipeline in real-time. 
            No signup required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Process Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Processing Pipeline</h3>
              {currentStep === 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDemo}
                  className="border-violet-500/50 hover:border-violet-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Demo
                </Button>
              )}
            </div>

            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 border transition-all duration-300 ${
                  step.status === 'active' 
                    ? 'border-violet-500 bg-violet-500/10' 
                    : step.status === 'complete'
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-white/10 bg-white/5'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      step.status === 'active'
                        ? 'bg-violet-500 text-white'
                        : step.status === 'complete'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                      
                      {step.status === 'active' && isProcessing && (
                        <div className="mt-2">
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-violet-500"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {step.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}

            {currentStep === 0 && !isProcessing && (
              <Button
                onClick={startDemo}
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Demo
              </Button>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-20">
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Live Preview</h3>
                
                <AnimatePresence mode="wait">
                  {currentStep === 0 && !isProcessing && (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-h-[400px] flex items-center justify-center"
                    >
                      <div className="text-center">
                        <FileSpreadsheet className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                        <p className="text-gray-400">Click "Start Demo" to begin</p>
                      </div>
                    </motion.div>
                  )}

                  {currentStep >= 1 && currentStep < 4 && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-h-[400px]"
                    >
                      {demoData && (
                        <div className="space-y-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Data Sample</h4>
                            <div className="overflow-x-auto">
                              <table className="text-xs text-gray-300">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-1 pr-4">Region</th>
                                    <th className="text-left py-1 pr-4">Organization</th>
                                    <th className="text-left py-1">Satisfaction</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {demoData.slice(0, 3).map((row: any, i: number) => (
                                    <tr key={i}>
                                      <td className="py-1 pr-4">{row.Region}</td>
                                      <td className="py-1 pr-4">{row.Organization}</td>
                                      <td className="py-1">{row.Satisfaction}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {currentStep >= 2 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white/5 rounded-lg p-4"
                            >
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Quality Score</h4>
                              <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-green-400">95</div>
                                <div className="flex-1">
                                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[95%]" />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 4 && reportPreview && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-h-[400px]"
                    >
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                          {reportPreview}
                        </pre>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-violet-500/50 hover:border-violet-500"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Try With Your Data
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveDemo;
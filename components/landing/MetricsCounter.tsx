'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, Users, FileText, BarChart3 } from 'lucide-react';

interface MetricProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  duration?: number;
}

function AnimatedCounter({ 
  value, 
  duration = 2,
  prefix = '',
  suffix = '' 
}: { 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endValue = value;
    const durationMs = duration * 1000;

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / durationMs, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(endValue * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function MetricCard({ label, value, suffix, prefix, icon, color, duration }: MetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
      
      <div className="relative glass-dark rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            {icon}
          </div>
          <motion.div
            animate={{ rotate: isInView ? 360 : 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-xs text-gray-400 font-mono"
          >
            LIVE
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-4xl font-bold text-white font-headline">
            <AnimatedCounter 
              value={value} 
              duration={duration}
              prefix={prefix}
              suffix={suffix}
            />
          </h3>
          <p className="text-sm text-gray-400 font-body">{label}</p>
        </div>

        {/* Animated pulse effect */}
        <motion.div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

export function MetricsCounter() {
  const [realTimeData, setRealTimeData] = useState({
    surveysProcessed: 487234,
    reportsGenerated: 15678,
    organizationsServed: 1247,
    dataPointsAnalyzed: 5843921,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        surveysProcessed: prev.surveysProcessed + Math.floor(Math.random() * 5),
        reportsGenerated: prev.reportsGenerated + (Math.random() > 0.7 ? 1 : 0),
        organizationsServed: prev.organizationsServed + (Math.random() > 0.95 ? 1 : 0),
        dataPointsAnalyzed: prev.dataPointsAnalyzed + Math.floor(Math.random() * 100),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: 'Surveys Processed',
      value: realTimeData.surveysProcessed,
      suffix: '+',
      icon: <FileText className="w-6 h-6 text-violet-400" />,
      color: 'bg-violet-500',
      duration: 2.5,
    },
    {
      label: 'Reports Generated',
      value: realTimeData.reportsGenerated,
      suffix: '+',
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      color: 'bg-purple-500',
      duration: 2,
    },
    {
      label: 'Healthcare Organizations',
      value: realTimeData.organizationsServed,
      suffix: '+',
      icon: <Users className="w-6 h-6 text-fuchsia-400" />,
      color: 'bg-fuchsia-500',
      duration: 2.2,
    },
    {
      label: 'Data Points Analyzed',
      value: realTimeData.dataPointsAnalyzed,
      suffix: '+',
      icon: <TrendingUp className="w-6 h-6 text-pink-400" />,
      color: 'bg-pink-500',
      duration: 3,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">
            <span className="text-white">Trusted by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Healthcare Leaders
            </span>
          </h2>
          <p className="text-lg text-gray-400 font-body max-w-2xl mx-auto">
            Processing millions of healthcare survey responses with enterprise-grade security and compliance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
            />
          ))}
        </div>

        {/* Live indicator */}
        <motion.div
          className="flex items-center justify-center mt-8 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Real-time metrics updated every 3 seconds
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export default MetricsCounter;
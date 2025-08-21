'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AdvancedHeroBackground } from '@/components/landing/backgrounds/AdvancedHeroBackground';
import { MetricsCounter } from '@/components/landing/MetricsCounter';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/GlassCard';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Building,
  TrendingUp,
  Lock,
  Sparkles
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const headlineVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(10px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

export default function Home() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [8, 12]);

  // Check for demo mode and redirect to dashboard
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      router.push('/');
    }
  }, [router]);

  const features = [
    {
      icon: Users,
      title: 'Intuitive Survey Builder',
      description: 'Create custom surveys with multiple question types, logic branching, and templates',
      color: 'violet',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track responses and visualize trends with interactive charts and dashboards',
      color: 'purple',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Control who can view, create, and analyze surveys with granular permissions',
      color: 'fuchsia',
    },
    {
      icon: TrendingUp,
      title: 'Completion Tracking',
      description: 'Monitor survey progress and send automated reminders to boost response rates',
      color: 'violet',
    },
    {
      icon: Lock,
      title: 'Secure & Compliant',
      description: 'HIPAA-compliant infrastructure with encrypted data storage and transmission',
      color: 'purple',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Advanced analysis identifies trends and generates actionable recommendations',
      color: 'fuchsia',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Surveys Created' },
    { value: '500K+', label: 'Responses Collected' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 glass-dark"
        style={{
          opacity: navOpacity,
          backdropFilter: `blur(${navBlur}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Building className="h-8 w-8 text-violet-400 mr-3" />
              <span className="text-xl font-bold text-white font-headline">Healthcare Survey</span>
            </motion.div>
            <div className="flex gap-4">
              <GlowButton 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/login')}
              >
                Sign In
              </GlowButton>
              <GlowButton 
                variant="primary"
                size="sm"
                onClick={() => router.push('/register')}
              >
                Get Started
              </GlowButton>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Advanced Background */}
      <AdvancedHeroBackground className="min-h-screen flex items-center" interactive={true}>
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="max-w-4xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 font-headline"
                variants={headlineVariants}
              >
                Transform Healthcare with
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  {' '}Data-Driven Insights
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-8 max-w-2xl font-body"
                variants={itemVariants}
              >
                The Keenan Healthcare Survey Dashboard empowers organizations to collect, analyze, and act on 
                employee healthcare feedback with powerful analytics and intuitive survey tools.
              </motion.p>
              
              <motion.div 
                className="flex gap-4 flex-wrap"
                variants={itemVariants}
              >
                <GlowButton 
                  size="lg" 
                  onClick={() => router.push('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </GlowButton>
                <GlowButton 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  View Demo
                </GlowButton>
              </motion.div>
              
              {/* Demo Mode Badge */}
              <motion.div 
                className="mt-8"
                variants={itemVariants}
              >
                <motion.div 
                  className="inline-flex items-center glass px-4 py-2 rounded-full text-sm"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="h-4 w-4 mr-2 text-violet-400" />
                  Demo Mode Available - No signup required
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AdvancedHeroBackground>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 font-headline">
              Everything You Need for Healthcare Surveys
            </h2>
            <p className="text-lg text-gray-400 font-body">
              Comprehensive tools designed for healthcare benefits assessment
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard hover glow={index === 0}>
                  <GlassCardHeader>
                    <motion.div 
                      className={`h-12 w-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                    </motion.div>
                    <GlassCardTitle>{feature.title}</GlassCardTitle>
                    <GlassCardDescription>
                      {feature.description}
                    </GlassCardDescription>
                  </GlassCardHeader>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 font-headline">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 font-body">
              Get started in minutes with our simple three-step process
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Create Your Survey', 'Collect Responses', 'Analyze & Act'].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 font-headline">{step}</h3>
                <p className="text-gray-400 font-body">
                  {index === 0 && 'Use our intuitive builder to design surveys tailored to your healthcare benefits assessment needs'}
                  {index === 1 && 'Share your survey link and watch as responses flow in with real-time progress tracking'}
                  {index === 2 && 'Get instant insights with comprehensive analytics and make data-driven decisions'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics Display */}
      <MetricsCounter />

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-bold mb-4 font-headline"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Healthcare Benefits Program?
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-400 mb-8 font-body"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of organizations using data-driven insights to improve employee healthcare satisfaction
          </motion.p>
          <motion.div 
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <GlowButton 
              size="lg"
              onClick={() => router.push('/register')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </GlowButton>
            <GlowButton 
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Sign In
            </GlowButton>
          </motion.div>
          
          <motion.div 
            className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400 flex-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 glass-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building className="h-6 w-6 text-violet-400 mr-2" />
              <span className="text-sm text-gray-400">
                © 2025 Keenan Healthcare Survey Dashboard. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <motion.a 
                href="#" 
                className="hover:text-violet-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-violet-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Terms of Service
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-violet-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Contact Support
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
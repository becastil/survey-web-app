'use client';
import { motion } from 'framer-motion';
import { HealthcareDashboard } from '@/components/healthcare/HealthcareDashboard';

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

export default function CSVAnalyticsPage() {
  return (
    <motion.div 
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HealthcareDashboard />
    </motion.div>
  );
}
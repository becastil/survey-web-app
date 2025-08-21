'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'light' | 'dark';
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  variant = 'dark',
  hover = true,
  glow = false,
  children,
  className,
  ...props
}: GlassCardProps) {
  const baseStyles = 'relative rounded-xl p-6 overflow-hidden';
  
  const variants = {
    light: 'glass bg-white/5',
    dark: 'glass-dark bg-black/30',
  };
  
  return (
    <motion.div
      className={cn(
        baseStyles,
        variants[variant],
        glow && 'glow-violet',
        className
      )}
      whileHover={hover ? {
        scale: 1.02,
        y: -5,
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function GlassCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function GlassCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-xl font-bold text-white font-headline', className)}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-gray-300 mt-2 font-body', className)}>
      {children}
    </p>
  );
}
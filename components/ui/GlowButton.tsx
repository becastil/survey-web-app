'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export function GlowButton({
  variant = 'primary',
  size = 'md',
  glow = true,
  children,
  className,
  ...props
}: GlowButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg font-headline';
  
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700',
    outline: 'bg-transparent border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <motion.button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && 'glow-violet',
        glow && variant === 'outline' && 'hover:glow-violet',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Animated background gradient */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
      
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{
          scale: [0, 1.5],
          opacity: [0.5, 0],
        }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
        }}
      />
    </motion.button>
  );
}
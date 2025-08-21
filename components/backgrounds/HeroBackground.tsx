'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import for SSR compatibility
const MeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((mod) => mod.MeshGradient),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />
  }
);

interface HeroBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function HeroBackground({ className = '', children }: HeroBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-black ${className}`}>
      {/* Layer 1: Primary MeshGradient */}
      <div className="absolute inset-0 z-0">
        <MeshGradient
          speed={0.3}
          colors={[
            '#000000', // Black base
            '#8B5CF6', // Violet
            '#A855F7', // Purple
            '#000000', // Black
            '#D946EF', // Fuchsia accent
          ]}
          className="h-full w-full"
        />
      </div>

      {/* Layer 2: Wireframe Overlay */}
      <div className="absolute inset-0 z-10 opacity-60">
        <MeshGradient
          speed={0.2}
          colors={[
            '#8B5CF6', // Violet
            '#FFFFFF', // White highlight
            '#A855F7', // Purple
            '#000000', // Black
            '#FFFFFF', // White pop
          ]}
          className="h-full w-full mix-blend-screen"
          style={{
            filter: 'contrast(1.5) brightness(0.8)',
          }}
        />
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      
      {/* Radial gradient for center focus */}
      <div className="absolute inset-0 z-20 bg-radial-gradient from-transparent via-black/10 to-black/50" />

      {/* Content Layer */}
      <div className="relative z-30">
        {children}
      </div>

      {/* Animated accent dots */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full z-25"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-3 h-3 bg-violet-400 rounded-full z-25"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-2 h-2 bg-fuchsia-400 rounded-full z-25"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

// Export a static version for better SSR
export function HeroBackgroundStatic({ className = '', children }: HeroBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br from-black via-violet-950 to-black ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
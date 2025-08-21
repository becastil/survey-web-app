'use client';

import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Dynamic import for Paper Shaders
const MeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((mod) => mod.MeshGradient),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />
  }
);

// 3D Healthcare Icon Component
function HealthcareIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

// Particle Field Component
function ParticleField() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push([x, y, z]);
    }
    return temp;
  }, []);

  return (
    <>
      {particles.map((position, i) => (
        <mesh key={i} position={position as [number, number, number]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
      ))}
    </>
  );
}

interface AdvancedHeroBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
}

export function AdvancedHeroBackground({ 
  className = '', 
  children,
  interactive = true 
}: AdvancedHeroBackgroundProps) {
  const { scrollY } = useScroll();
  const layer1Y = useTransform(scrollY, [0, 500], [0, -50]);
  const layer2Y = useTransform(scrollY, [0, 500], [0, -100]);
  const layer3Y = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className={`relative w-full overflow-hidden bg-black ${className}`}>
      {/* Layer 1: Base MeshGradient */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: layer1Y }}
      >
        <MeshGradient
          speed={0.2}
          colors={[
            '#000000',
            '#1a0033',
            '#330066',
            '#4B0082',
            '#000000',
          ]}
          className="h-[120%] w-full"
        />
      </motion.div>

      {/* Layer 2: Secondary MeshGradient with blend mode */}
      <motion.div 
        className="absolute inset-0 z-10 opacity-40"
        style={{ y: layer2Y }}
      >
        <MeshGradient
          speed={0.3}
          colors={[
            '#8B5CF6',
            '#A855F7',
            '#D946EF',
            '#EC4899',
            '#8B5CF6',
          ]}
          className="h-[120%] w-full mix-blend-screen"
          style={{
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* Layer 3: 3D Healthcare Icons */}
      {interactive && (
        <motion.div 
          className="absolute inset-0 z-20"
          style={{ y: layer3Y }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            className="h-full w-full"
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
            <HealthcareIcon position={[-2, 1, 0]} scale={0.8} />
            <HealthcareIcon position={[2, -1, 0]} scale={0.6} />
            <HealthcareIcon position={[0, 0, -2]} scale={1} />
            <ParticleField />
          </Canvas>
        </motion.div>
      )}

      {/* Layer 4: Gradient Overlays */}
      <div className="absolute inset-0 z-25">
        {/* Top gradient for navbar readability */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        
        {/* Center radial gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />
        
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Animated Accent Elements */}
      <div className="absolute inset-0 z-26 pointer-events-none">
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-30">
        {children}
      </div>

      {/* Performance Monitor (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>Advanced Hero BG</div>
          <div>Layers: 4 Active</div>
        </div>
      )}
    </div>
  );
}

// Optimized static version for better performance on low-end devices
export function AdvancedHeroBackgroundStatic({ className = '', children }: AdvancedHeroBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br from-black via-violet-950/50 to-black ${className}`}>
      {/* Static gradient layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-fuchsia-900/30 via-transparent to-transparent" />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default AdvancedHeroBackground;
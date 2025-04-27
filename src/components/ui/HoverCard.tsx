'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  hoverScale?: number;
  as?: keyof JSX.IntrinsicElements;
}

export function HoverCard({
  children,
  className,
  glowColor = 'rgba(168, 85, 247, 0.4)', // Purple glow
  borderColor = 'rgba(168, 85, 247, 0.2)',
  backgroundColor = 'rgba(17, 17, 17, 0.8)',
  hoverScale = 1.02,
  as: Component = 'div',
}: HoverCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-xl backdrop-blur-sm transition-all duration-300',
        'border p-6',
        className
      )}
      initial={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      whileHover={{
        scale: hoverScale,
        borderColor,
        boxShadow: `0 0 20px ${glowColor}`,
        backgroundColor,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Variant with glass background effect
export function GlassCard({
  children,
  className,
  hoverScale = 1.02,
  ...props
}: HoverCardProps) {
  return (
    <HoverCard
      className={cn(
        'backdrop-blur-lg bg-white/10 border-white/20',
        'shadow-lg',
        className
      )}
      glowColor="rgba(255, 255, 255, 0.2)"
      borderColor="rgba(255, 255, 255, 0.3)"
      backgroundColor="rgba(255, 255, 255, 0.15)"
      hoverScale={hoverScale}
      {...props}
    >
      {children}
    </HoverCard>
  );
} 
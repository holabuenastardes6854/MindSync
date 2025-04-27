'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PulseEffectProps {
  children: React.ReactNode;
  className?: string;
  pulseColor?: string;
  pulseInterval?: number;
  pulseSize?: number;
  disabled?: boolean;
  infinite?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

export function PulseEffect({
  children,
  className,
  pulseColor = 'rgba(255, 255, 255, 0.3)',
  pulseInterval = 2,
  pulseSize = 1.1,
  disabled = false,
  infinite = true,
  duration = 1.5,
  delay = 0,
  easing = 'easeInOut',
}: PulseEffectProps) {
  const pulseVariants = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    pulse: {
      opacity: [0, 0.4, 0],
      scale: [1, pulseSize, 1],
      transition: {
        opacity: { duration, ease: easing },
        scale: { duration, ease: easing },
        repeat: infinite ? Infinity : 0,
        repeatDelay: pulseInterval - duration,
        delay,
      },
    },
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="absolute inset-0 rounded-inherit z-0"
        initial="initial"
        animate="pulse"
        variants={pulseVariants}
        style={{
          backgroundColor: pulseColor,
          borderRadius: 'inherit',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Preset variations
export function SubtlePulse(props: Omit<PulseEffectProps, 'pulseSize' | 'pulseColor'>) {
  return (
    <PulseEffect
      pulseSize={1.05}
      pulseColor="rgba(255, 255, 255, 0.15)"
      {...props}
    />
  );
}

export function AttentionPulse(props: Omit<PulseEffectProps, 'pulseSize' | 'pulseColor' | 'pulseInterval'>) {
  return (
    <PulseEffect
      pulseSize={1.15}
      pulseColor="rgba(255, 127, 80, 0.3)"
      pulseInterval={1.5}
      {...props}
    />
  );
}

export function SuccessPulse(props: Omit<PulseEffectProps, 'pulseColor'>) {
  return <PulseEffect pulseColor="rgba(46, 213, 115, 0.3)" {...props} />;
}

export function ErrorPulse(props: Omit<PulseEffectProps, 'pulseColor'>) {
  return <PulseEffect pulseColor="rgba(255, 71, 87, 0.3)" {...props} />;
} 
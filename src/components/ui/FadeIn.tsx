'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  staggerChildren?: number;
  staggerDirection?: 'forward' | 'reverse';
}

export function FadeIn({
  children,
  className,
  direction = 'up',
  distance = 20,
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.1,
  staggerChildren = 0,
  staggerDirection = 'forward',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  
  // Define initial positions based on direction
  const initialX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const initialY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
      x: initialX,
      y: initialY,
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing curve for smoother motion
        staggerChildren: staggerChildren,
        staggerDirection: staggerDirection === 'reverse' ? -1 : 1,
      },
    },
  };
  
  // Child item variants for staggered animations
  const childVariants = staggerChildren > 0 ? {
    hidden: { 
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
    },
    visible: { 
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration * 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  } : {};

  return (
    <motion.div
      ref={ref}
      className={cn('', className)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {staggerChildren > 0 && React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      )) || children}
    </motion.div>
  );
}

// Preset variations
export function FadeInUp(props: Omit<FadeInProps, 'direction'>) {
  return <FadeIn direction="up" {...props} />;
}

export function FadeInDown(props: Omit<FadeInProps, 'direction'>) {
  return <FadeIn direction="down" {...props} />;
}

export function FadeInLeft(props: Omit<FadeInProps, 'direction'>) {
  return <FadeIn direction="left" {...props} />;
}

export function FadeInRight(props: Omit<FadeInProps, 'direction'>) {
  return <FadeIn direction="right" {...props} />;
}

export function StaggerFadeIn(props: Omit<FadeInProps, 'staggerChildren'>) {
  return <FadeIn staggerChildren={0.1} {...props} />;
} 
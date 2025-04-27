'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  threshold?: number;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollFadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 50,
  once = true,
  threshold = 0.1,
  as: Component = 'div',
}: ScrollFadeInProps) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold 
  });
  
  // Calculate initial and animate states based on direction
  const getDirectionalProps = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'none':
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  useEffect(() => {
    if (isInView) {
      controls.start({ x: 0, y: 0, opacity: 1 });
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={getDirectionalProps()}
      animate={controls}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Custom cubic bezier for smooth animation
      }}
    >
      {children}
    </motion.div>
  );
}

// Preset variations for commonly used animations
export function FadeUp(props: Omit<ScrollFadeInProps, 'direction'>) {
  return <ScrollFadeIn direction="up" {...props} />;
}

export function FadeDown(props: Omit<ScrollFadeInProps, 'direction'>) {
  return <ScrollFadeIn direction="down" {...props} />;
}

export function FadeLeft(props: Omit<ScrollFadeInProps, 'direction'>) {
  return <ScrollFadeIn direction="left" {...props} />;
}

export function FadeRight(props: Omit<ScrollFadeInProps, 'direction'>) {
  return <ScrollFadeIn direction="right" {...props} />;
}

export function FadeIn(props: Omit<ScrollFadeInProps, 'direction'>) {
  return <ScrollFadeIn direction="none" {...props} />;
} 
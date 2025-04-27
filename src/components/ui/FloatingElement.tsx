'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  frequency?: number;
  disabled?: boolean;
  delay?: number;
  randomize?: boolean;
  direction?: 'vertical' | 'horizontal' | 'both';
  easing?: string;
}

export function FloatingElement({
  children,
  className,
  amplitude = 5,
  frequency = 4,
  disabled = false,
  delay = 0,
  randomize = true,
  direction = 'vertical',
  easing = 'easeInOut',
}: FloatingElementProps) {
  const controls = useAnimationControls();
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    // Add slight randomization to make multiple elements look more natural
    if (randomize) {
      const randomAmplitude = amplitude * (0.8 + Math.random() * 0.4);
      const randomFrequency = frequency * (0.9 + Math.random() * 0.2);
      const randomDelay = delay + Math.random() * 0.5;
      
      setRandomOffset({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      });

      // Create the floating animation
      const xMovement = direction === 'horizontal' || direction === 'both' 
        ? randomAmplitude * 0.7 * randomOffset.x 
        : 0;
      
      const yMovement = direction === 'vertical' || direction === 'both' 
        ? randomAmplitude 
        : 0;

      const animate = async () => {
        await controls.start({
          y: yMovement,
          x: xMovement,
          transition: {
            duration: randomFrequency,
            ease: easing,
            delay: randomDelay,
          },
        });
        
        await controls.start({
          y: direction === 'vertical' || direction === 'both' ? -yMovement : 0,
          x: direction === 'horizontal' || direction === 'both' ? -xMovement : 0,
          transition: {
            duration: randomFrequency,
            ease: easing,
          },
        });
        
        animate();
      };
      
      animate();
    } else {
      // Create a simpler deterministic animation when randomize is false
      const animate = async () => {
        const xMovement = direction === 'horizontal' || direction === 'both' ? amplitude * 0.7 : 0;
        const yMovement = direction === 'vertical' || direction === 'both' ? amplitude : 0;
        
        await controls.start({
          y: yMovement,
          x: xMovement,
          transition: {
            duration: frequency,
            ease: easing,
            delay,
          },
        });
        
        await controls.start({
          y: direction === 'vertical' || direction === 'both' ? -yMovement : 0,
          x: direction === 'horizontal' || direction === 'both' ? -xMovement : 0,
          transition: {
            duration: frequency,
            ease: easing,
          },
        });
        
        animate();
      };
      
      animate();
    }
  }, [
    amplitude, 
    controls, 
    delay, 
    disabled, 
    direction, 
    easing, 
    frequency, 
    randomize, 
    randomOffset
  ]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn('', className)}
      animate={controls}
      initial={{ y: 0, x: 0 }}
    >
      {children}
    </motion.div>
  );
}

// Preset variations
export function GentleFloat(props: Omit<FloatingElementProps, 'amplitude' | 'frequency'>) {
  return (
    <FloatingElement
      amplitude={3}
      frequency={5}
      {...props}
    />
  );
}

export function BreathingFloat(props: Omit<FloatingElementProps, 'amplitude' | 'frequency' | 'direction'>) {
  return (
    <FloatingElement
      amplitude={4}
      frequency={3}
      direction="vertical"
      {...props}
    />
  );
}

export function SideToSideFloat(props: Omit<FloatingElementProps, 'direction'>) {
  return <FloatingElement direction="horizontal" {...props} />;
}

export function OrbitFloat(props: Omit<FloatingElementProps, 'direction'>) {
  return <FloatingElement direction="both" {...props} />;
} 
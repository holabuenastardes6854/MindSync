'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  intensity?: number;
  disabled?: boolean;
  transformOrigin?: string;
  rotateEnabled?: boolean;
  translateEnabled?: boolean;
}

export function Parallax({
  children,
  className,
  speed = 0.05,
  intensity = 1,
  disabled = false,
  transformOrigin = 'center',
  rotateEnabled = true,
  translateEnabled = true,
}: ParallaxProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elementCenter, setElementCenter] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Smoothed values for animation
  const springX = useSpring(0, { stiffness: 150, damping: 20 });
  const springY = useSpring(0, { stiffness: 150, damping: 20 });

  // Adjust translation and rotation based on mouse position
  const rotateX = useTransform(
    springY, 
    [-1, 1], 
    rotateEnabled ? [intensity * 5, -intensity * 5] : [0, 0]
  );
  const rotateY = useTransform(
    springX, 
    [-1, 1], 
    rotateEnabled ? [-intensity * 5, intensity * 5] : [0, 0]
  );
  const translateX = useTransform(
    springX, 
    [-1, 1], 
    translateEnabled ? [-intensity * 10, intensity * 10] : [0, 0]
  );
  const translateY = useTransform(
    springY, 
    [-1, 1], 
    translateEnabled ? [-intensity * 10, intensity * 10] : [0, 0]
  );

  // Calculate the normalized position relative to the element's center
  const updateSprings = (e: MouseEvent) => {
    if (disabled || !elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate normalized values (-1 to 1)
    const normalizedX = (e.clientX - centerX) / (window.innerWidth / 2);
    const normalizedY = (e.clientY - centerY) / (window.innerHeight / 2);
    
    // Update spring values with the speed factor
    springX.set(normalizedX * speed);
    springY.set(normalizedY * speed);
  };

  useEffect(() => {
    // Get element dimensions on mount and window resize
    const updateElementCenter = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setElementCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', updateSprings);
    window.addEventListener('resize', updateElementCenter);
    
    // Initial setup
    updateElementCenter();
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', updateSprings);
      window.removeEventListener('resize', updateElementCenter);
    };
  }, [disabled, speed]);

  return (
    <motion.div
      ref={elementRef}
      className={cn(className)}
      style={{
        transformOrigin,
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

// Preset variations with different intensities
export function SubtleParallax(props: Omit<ParallaxProps, 'intensity'>) {
  return <Parallax intensity={0.5} {...props} />;
}

export function StrongParallax(props: Omit<ParallaxProps, 'intensity'>) {
  return <Parallax intensity={2} {...props} />;
}

export function TiltOnly(props: Omit<ParallaxProps, 'translateEnabled'>) {
  return <Parallax translateEnabled={false} {...props} />;
}

export function FloatOnly(props: Omit<ParallaxProps, 'rotateEnabled'>) {
  return <Parallax rotateEnabled={false} {...props} />;
} 
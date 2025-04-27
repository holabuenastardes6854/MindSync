'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  progress,
  total,
  color = 'bg-indigo-600',
  showPercentage = true,
  height = 8,
  animated = true,
  label,
  className = '',
}: ProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min(Math.round((progress / total) * 100), 100);
  
  // Handle intersection observer for reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Animate progress on value change
  useEffect(() => {
    if (isVisible) {
      controls.start({
        width: `${percentage}%`,
        transition: { 
          duration: animated ? 0.8 : 0,
          ease: 'easeOut'
        },
      });
    }
  }, [percentage, isVisible, animated, controls]);
  
  // Define track gradient - subtle enhancement
  const trackGradient = `bg-gray-200 dark:bg-gray-700`;
  
  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
    >
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          
          {showPercentage && (
            <motion.span 
              className="text-sm font-semibold text-gray-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={percentage} // Re-animate when percentage changes
            >
              {percentage}%
            </motion.span>
          )}
        </div>
      )}
      
      <div 
        className={`w-full ${trackGradient} rounded-full overflow-hidden`} 
        style={{ height }}
      >
        <motion.div
          className={`${color} h-full rounded-full relative overflow-hidden`}
          initial={{ width: '0%' }}
          animate={controls}
        >
          {animated && (
            <motion.div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
      
      <AnimatePresence>
        {percentage === 100 && (
          <motion.div 
            className="mt-1 text-xs text-green-600 font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Complete!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
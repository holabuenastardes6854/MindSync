'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  duration: number; // Duration in minutes
  isPlaying: boolean;
  onComplete?: () => void;
  showRemainingTime?: boolean;
  showProgressCircle?: boolean;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  hideHours?: boolean;
  pulseAnimation?: boolean;
}

export function SessionTimer({
  duration,
  isPlaying,
  onComplete,
  showRemainingTime = true,
  showProgressCircle = true,
  className,
  color = '#8B5CF6', // Default purple
  size = 'md',
  hideHours = false,
  pulseAnimation = true,
}: SessionTimerProps) {
  // Convert minutes to milliseconds for calculations
  const totalDurationMs = duration * 60 * 1000;
  
  // State for remaining time and progress
  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Calculate progress percentage
  const progress = (totalDurationMs - remainingMs) / totalDurationMs;
  const progressPercent = progress * 100;
  
  // Calculate time values for display
  const getTimeValues = useCallback(() => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
    };
  }, [remainingMs]);
  
  // Format time display
  const formatTime = useCallback(() => {
    const { hours, minutes, seconds } = getTimeValues();
    
    if (hideHours || hours === 0) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [getTimeValues, hideHours]);
  
  // Size classes based on prop
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-base',
    lg: 'w-28 h-28 text-lg',
  };
  
  // Calculate circle path
  const calculateCirclePath = () => {
    // Different sizes based on component size
    const radius = size === 'sm' ? 20 : size === 'md' ? 35 : 50;
    const circumference = 2 * Math.PI * radius;
    
    return {
      radius,
      circumference,
      strokeDashoffset: circumference - (progress * circumference),
    };
  };
  
  const { radius, circumference, strokeDashoffset } = calculateCirclePath();
  
  // Pulse animation when time is running low
  useEffect(() => {
    const { totalSeconds } = getTimeValues();
    // Start pulsing when less than 10% of time remains
    const shouldPulse = pulseAnimation && totalSeconds <= (duration * 60 * 0.1);
    
    if (shouldPulse !== isPulsing) {
      setIsPulsing(shouldPulse);
    }
  }, [remainingMs, duration, getTimeValues, pulseAnimation, isPulsing]);
  
  // Timer countdown logic
  useEffect(() => {
    if (!isPlaying) {
      setLastUpdateTime(null);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      
      if (lastUpdateTime === null) {
        setLastUpdateTime(now);
        return;
      }
      
      const elapsed = now - lastUpdateTime;
      const newRemainingMs = Math.max(0, remainingMs - elapsed);
      
      setRemainingMs(newRemainingMs);
      setLastUpdateTime(now);
      
      if (newRemainingMs <= 0 && onComplete) {
        onComplete();
      }
    };
    
    const timerId = setInterval(updateTimer, 100); // Update more frequently for smoother animation
    
    return () => clearInterval(timerId);
  }, [isPlaying, lastUpdateTime, remainingMs, onComplete]);
  
  // Reset timer when duration changes
  useEffect(() => {
    setRemainingMs(totalDurationMs);
  }, [totalDurationMs]);
  
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {showProgressCircle && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={size === 'sm' ? 3 : 4}
          />
          
          {/* Progress indicator */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={size === 'sm' ? 3 : 4}
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset,
              // Pulse at end of timer
              stroke: isPulsing ? [color, 'rgba(255, 100, 100, 1)', color] : color,
            }}
            transition={{ 
              strokeDashoffset: { duration: 0.1, ease: 'linear' },
              stroke: isPulsing ? { 
                repeat: Infinity, 
                duration: 1,
                ease: 'easeInOut',
              } : { duration: 0 },
            }}
          />
        </svg>
      )}
      
      <div className="flex flex-col items-center justify-center">
        {showRemainingTime && (
          <motion.div 
            className={cn(
              'font-mono font-medium',
              isPulsing && 'text-red-400'
            )}
            animate={isPulsing ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={isPulsing ? {
              repeat: Infinity,
              duration: 1,
              ease: 'easeInOut',
            } : {}}
          >
            {formatTime()}
          </motion.div>
        )}
        
        {/* Optional play/pause status icon */}
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            className="absolute -bottom-6 text-gray-400"
          >
            <Icon icon="lucide:pause" className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Variations
export function CompactTimer(props: Omit<SessionTimerProps, 'size' | 'showProgressCircle'>) {
  return <SessionTimer size="sm" showProgressCircle={false} {...props} />;
}

export function RoundTimer(props: Omit<SessionTimerProps, 'showProgressCircle'>) {
  return <SessionTimer showProgressCircle={true} {...props} />;
}

export function MinimalTimer(props: Omit<SessionTimerProps, 'showProgressCircle' | 'pulseAnimation'>) {
  return <SessionTimer showProgressCircle={false} pulseAnimation={false} {...props} />;
} 
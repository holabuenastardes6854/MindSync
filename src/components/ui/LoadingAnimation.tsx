'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  text?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  fullscreen?: boolean;
  skeletonRows?: number;
  skeletonWidth?: string | number;
}

export function LoadingAnimation({
  variant = 'spinner',
  size = 'md',
  color,
  className,
  text,
  textPosition = 'bottom',
  fullscreen = false,
  skeletonRows = 3,
  skeletonWidth = '100%',
}: LoadingAnimationProps) {
  // Size variants
  const sizeVariants = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Color classes
  const colorClass = color ? '' : 'text-primary';
  
  // Container classes for fullscreen
  const containerClasses = cn(
    'flex items-center justify-center',
    fullscreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    className
  );
  
  // Text position classes
  const contentClasses = cn(
    'flex',
    textPosition === 'left' && 'flex-row-reverse items-center gap-3',
    textPosition === 'right' && 'flex-row items-center gap-3',
    textPosition === 'top' && 'flex-col-reverse items-center gap-2',
    textPosition === 'bottom' && 'flex-col items-center gap-2',
  );

  // Text component
  const TextComponent = text ? (
    <span className="text-sm font-medium">{text}</span>
  ) : null;

  // Spinner animation
  const renderSpinner = () => (
    <motion.div 
      className={cn(
        "border-2 border-t-transparent rounded-full",
        sizeVariants[size],
        colorClass
      )}
      style={{ 
        borderTopColor: 'transparent',
        borderColor: color || 'currentColor',
      }}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    />
  );

  // Dots animation
  const renderDots = () => {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
    };
    
    const dotVariants = {
      animate: (i: number) => ({
        y: [0, -10, 0],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut"
        }
      })
    };
    
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            className={cn(
              "rounded-full",
              dotSize[size],
              colorClass
            )}
            style={{ 
              backgroundColor: color || 'currentColor',
            }}
          />
        ))}
      </div>
    );
  };

  // Pulse animation
  const renderPulse = () => (
    <motion.div
      className={cn(
        "rounded-full",
        sizeVariants[size],
        colorClass
      )}
      style={{ 
        backgroundColor: color || 'currentColor',
      }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Skeleton loader
  const renderSkeleton = () => {
    const skeletonHeight = {
      xs: 'h-2',
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-5',
    };
    
    return (
      <div className="w-full flex flex-col gap-2">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "bg-muted rounded-md",
              skeletonHeight[size],
            )}
            style={{ 
              width: typeof skeletonWidth === 'number' ? `${skeletonWidth}px` : skeletonWidth,
              ...(i === skeletonRows - 1 ? { width: 'calc(70%)' } : {})
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  };

  // Render different variants
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {renderLoader()}
        {TextComponent}
      </div>
    </div>
  );
}

// Preset variations
export function Spinner(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation variant="spinner" {...props} />;
}

export function DotsLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation variant="dots" {...props} />;
}

export function PulseLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation variant="pulse" {...props} />;
}

export function SkeletonLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation variant="skeleton" {...props} />;
} 
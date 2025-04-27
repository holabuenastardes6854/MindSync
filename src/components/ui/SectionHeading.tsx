'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  underlineColor?: string;
  size?: 'sm' | 'md' | 'lg';
  animateUnderline?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  className,
  align = 'left',
  underlineColor = 'bg-primary',
  size = 'md',
  animateUnderline = true,
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const sizeClasses = {
    sm: {
      title: 'text-xl md:text-2xl font-bold',
      subtitle: 'text-sm md:text-base',
      underline: 'h-1 w-12',
    },
    md: {
      title: 'text-2xl md:text-3xl font-bold',
      subtitle: 'text-base md:text-lg',
      underline: 'h-1 w-16',
    },
    lg: {
      title: 'text-3xl md:text-4xl font-bold',
      subtitle: 'text-lg md:text-xl',
      underline: 'h-1.5 w-20',
    },
  };

  const underlineVariants = {
    initial: { width: 0 },
    animate: {
      width: '100%',
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className={cn('flex flex-col gap-2', alignmentClasses[align], className)}>
      <h2 className={sizeClasses[size].title}>{title}</h2>
      
      {animateUnderline ? (
        <motion.div
          className={cn(underlineColor, sizeClasses[size].underline, 'rounded-full')}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={underlineVariants}
        />
      ) : (
        <div className={cn(underlineColor, sizeClasses[size].underline, 'rounded-full')} />
      )}
      
      {subtitle && (
        <p className={cn('text-muted-foreground mt-2', sizeClasses[size].subtitle)}>
          {subtitle}
        </p>
      )}
    </div>
  );
} 
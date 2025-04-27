'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type GradientType = 'primary' | 'secondary' | 'blue' | 'green' | 'purple' | 'orange' | 'rainbow';

const gradientMap: Record<GradientType, string> = {
  primary: 'from-purple-600 via-pink-600 to-blue-600',
  secondary: 'from-amber-500 via-orange-600 to-yellow-500',
  blue: 'from-blue-600 via-cyan-500 to-blue-400',
  green: 'from-green-500 via-emerald-500 to-teal-500',
  purple: 'from-purple-600 via-violet-600 to-indigo-600',
  orange: 'from-orange-500 via-amber-500 to-yellow-500',
  rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-600 to-purple-700'
};

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: GradientType;
  className?: string;
  animate?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export default function GradientText({
  children,
  gradient = 'primary',
  className,
  animate = false,
  as: Component = 'span',
}: GradientTextProps) {
  const gradientClasses = gradientMap[gradient] || gradientMap.primary;
  
  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-r',
        gradientClasses,
        animate && 'animate-gradient bg-[length:200%_auto]',
        className
      )}
    >
      {children}
    </Component>
  );
} 
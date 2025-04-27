'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animateOnHover?: boolean;
  animationVariant?: 'lift' | 'glow' | 'border' | 'none';
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  className = '',
  animateOnHover = false,
  animationVariant = 'lift',
  onClick,
  interactive = false,
  variant = 'default',
  padding = 'medium',
}: CardProps) {
  const baseClasses = 'relative rounded-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
    flat: 'bg-gray-50 dark:bg-gray-900',
  };

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8',
  };

  const interactiveClasses = interactive ? 'cursor-pointer' : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `;

  // Animation variants
  const animationVariants = {
    lift: {
      initial: { y: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
      hover: animateOnHover ? { 
        y: -5, 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      } : {},
    },
    glow: {
      initial: { boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
      hover: animateOnHover ? { 
        boxShadow: '0 0 15px 2px rgba(66, 153, 225, 0.5)'
      } : {},
    },
    border: {
      initial: { borderColor: 'rgba(226, 232, 240, 1)' },
      hover: animateOnHover ? { 
        borderColor: 'rgba(66, 153, 225, 1)'
      } : {},
    },
    none: {
      initial: {},
      hover: {},
    },
  };

  return (
    <motion.div
      className={combinedClasses}
      onClick={onClick}
      variants={animationVariants[animationVariant]}
      initial="initial"
      whileHover="hover"
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
} 
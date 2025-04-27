'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disableHoverEffect?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  disableHoverEffect = false,
  ...props
}: ButtonProps) {
  // Base classes for the button
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Classes for different variants
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'bg-transparent text-blue-600 hover:underline p-0 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  // Classes for different sizes
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  // Disabled state
  const isDisabled = disabled || isLoading;
  const disabledClasses = isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';
  
  // Full width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${variant !== 'link' ? sizeClasses[size] : ''}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;
  
  // Hover animation variants
  const hoverAnimation = {
    initial: { scale: 1 },
    hover: { scale: disableHoverEffect ? 1 : 1.02 },
    tap: { scale: disableHoverEffect ? 1 : 0.98 },
  };

  return (
    <motion.button
      className={buttonClasses}
      disabled={isDisabled}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={hoverAnimation}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </motion.button>
  );
} 
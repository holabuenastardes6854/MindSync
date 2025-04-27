'use client';

import React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Create a custom type for the properties we want to handle
interface IconButtonProps {
  icon: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'full';
  animation?: 'scale' | 'rotate' | 'pulse' | 'bounce' | 'ring' | 'none';
  activeIcon?: string;
  isActive?: boolean;
  activeColor?: string;
  color?: string;
  badge?: number | string;
  badgeColor?: string;
  isLoading?: boolean;
  tooltipText?: string;
  withRing?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// Export the full icon button props for use when extending
export type FullIconButtonProps = IconButtonProps & Omit<HTMLMotionProps<"button">, keyof IconButtonProps>;

export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  animation = 'scale',
  activeIcon,
  isActive = false,
  activeColor,
  color,
  badge,
  badgeColor = 'bg-red-500',
  isLoading = false,
  tooltipText,
  withRing = false,
  className,
  disabled,
  onClick,
  ...props
}: FullIconButtonProps) {
  // Size mappings
  const sizeClasses = {
    xs: 'p-1 w-6 h-6',
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-3 w-12 h-12',
  };
  
  // Rounded corner mappings
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Variant mappings for background, text color, border
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'bg-transparent hover:bg-gray-700/10 text-gray-300 hover:text-white',
    outline: 'bg-transparent border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white',
    glow: 'bg-transparent border border-purple-800/50 text-purple-400 hover:text-white shadow-sm shadow-purple-900/30 hover:shadow-purple-600/40 hover:border-purple-700/80',
  };
  
  // Icon size based on button size
  const iconSize = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  // Ring for focus states
  const ringClass = withRing ? 'focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-2 focus:ring-offset-gray-900' : '';
  
  // Animation variants for hover and tap
  const getAnimationVariants = (): Variants => {
    switch (animation) {
      case 'scale':
        return {
          hover: { scale: 1.05 },
          tap: { scale: 0.95 },
        };
      case 'rotate':
        return {
          hover: { rotate: 15 },
          tap: { rotate: -5, scale: 0.95 },
        };
      case 'pulse':
        return {
          hover: { 
            scale: [1, 1.05, 1], 
            transition: { repeat: Infinity, duration: 1 } 
          },
          tap: { scale: 0.95 },
        };
      case 'bounce':
        return {
          hover: { 
            y: [0, -3, 0], 
            transition: { repeat: Infinity, duration: 0.6 } 
          },
          tap: { y: 2 },
        };
      case 'ring':
        return {
          hover: {
            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3)',
          },
          tap: { boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.5)' },
        };
      case 'none':
      default:
        // Return empty variants but with defined properties to satisfy the type
        return {
          hover: { scale: 1 },
          tap: { scale: 1 },
        };
    }
  };

  // Choose icon based on active state
  const displayIcon = isActive && activeIcon ? activeIcon : icon;
  
  // Choose text color based on active state
  const textColorClass = isActive && activeColor ? '' : '';
  const textColor = isActive && activeColor ? activeColor : color;
  
  const isDisabled = disabled || isLoading;
  
  // Get variants once to avoid regenerating on each render
  const animationVariants = getAnimationVariants();
  
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center transition-colors',
        sizeClasses[size],
        roundedClasses[rounded],
        variantClasses[variant],
        ringClass,
        isDisabled && 'opacity-50 cursor-not-allowed',
        textColorClass,
        className
      )}
      initial={{ scale: 1 }}
      whileHover={!isDisabled ? 'hover' : undefined}
      whileTap={!isDisabled ? 'tap' : undefined}
      variants={animationVariants}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin">
          <Icon 
            icon="svg-spinners:3-dots-fade" 
            width={iconSize[size]} 
            height={iconSize[size]}
          />
        </div>
      ) : (
        <Icon 
          icon={displayIcon} 
          width={iconSize[size]} 
          height={iconSize[size]}
          style={{ color: textColor }}
        />
      )}
      
      {/* Optional Badge */}
      {badge && (
        <span 
          className={cn(
            'absolute -top-1 -right-1 text-[10px] font-bold flex items-center justify-center min-w-[16px] h-4 rounded-full px-1 text-white',
            badgeColor
          )}
        >
          {badge}
        </span>
      )}
      
      {/* Optional Tooltip */}
      {tooltipText && !isDisabled && (
        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 px-2 py-1 text-xs bg-gray-900 text-white rounded pointer-events-none whitespace-nowrap transition-opacity">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </motion.button>
  );
}

// Preset variants
export function PlayButton(props: Omit<FullIconButtonProps, 'icon' | 'activeIcon' | 'variant' | 'rounded'>) {
  return (
    <IconButton
      icon="lucide:play"
      activeIcon="lucide:pause"
      variant="primary"
      rounded="full"
      {...props}
    />
  );
}

export function SkipButton(props: Omit<FullIconButtonProps, 'icon' | 'variant' | 'rounded'>) {
  return (
    <IconButton
      icon="lucide:skip-forward"
      variant="ghost"
      rounded="full"
      {...props}
    />
  );
}

export function VolumeButton(props: Omit<FullIconButtonProps, 'icon' | 'activeIcon' | 'variant'>) {
  const { isActive, ...rest } = props;
  
  return (
    <IconButton
      icon={isActive ? "lucide:volume-2" : "lucide:volume-x"}
      variant="ghost"
      isActive={isActive}
      {...rest}
    />
  );
} 
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  maxWidth?: number;
  dark?: boolean;
}

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  maxWidth = 250,
  dark = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation variants based on position
  const positionVariants = {
    top: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -10 },
      visible: { opacity: 1, x: 0 },
    },
    bottom: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: 10 },
      visible: { opacity: 1, x: 0 },
    },
  };

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      default:
        return {};
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    // We don't need to store the position since we're not using it
  };

  // Reposition on window resize
  useEffect(() => {
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    calculatePosition();
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  // Check for tooltip going offscreen and adjust position
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;
    
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust if going offscreen
    const newStyles = { ...getPositionStyles() };
    
    if (position === 'top' || position === 'bottom') {
      if (tooltipRect.left < 0) {
        newStyles.transform = 'translateX(0)';
        newStyles.left = '0';
      } else if (tooltipRect.right > viewportWidth) {
        newStyles.transform = 'translateX(0)';
        newStyles.left = 'auto';
        newStyles.right = '0';
      }
    }
    
    if (position === 'left' || position === 'right') {
      if (tooltipRect.top < 0) {
        newStyles.transform = 'translateY(0)';
        newStyles.top = '0';
      } else if (tooltipRect.bottom > viewportHeight) {
        newStyles.transform = 'translateY(0)';
        newStyles.top = 'auto';
        newStyles.bottom = '0';
      }
    }
    
    // Apply adjusted styles - use a safer approach to avoid readonly properties
    if (tooltipRef.current) {
      const style = tooltipRef.current.style;
      
      // Safely set each property if it's a writable CSS property
      if ('transform' in newStyles) style.transform = newStyles.transform as string;
      if ('left' in newStyles) style.left = newStyles.left as string;
      if ('right' in newStyles) style.right = newStyles.right as string;
      if ('top' in newStyles) style.top = newStyles.top as string;
      if ('bottom' in newStyles) style.bottom = newStyles.bottom as string;
    }
  }, [isVisible, position]);

  const tooltipClasses = `
    ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 shadow-md border border-gray-200'} 
    rounded-md py-2 px-3 text-sm z-50
  `;

  return (
    <div
      ref={triggerRef}
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`absolute pointer-events-none ${tooltipClasses} ${className}`}
            style={{ ...getPositionStyles(), maxWidth }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={positionVariants[position]}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {content}
            
            {/* Arrow/Caret */}
            <div
              className={`absolute w-2 h-2 ${
                dark ? 'bg-gray-900' : 'bg-white border-gray-200 border'
              } transform rotate-45 ${
                position === 'top' ? 'bottom-0 -mb-1 left-1/2 -ml-1 border-r-0 border-t-0' :
                position === 'right' ? 'left-0 -ml-1 top-1/2 -mt-1 border-r-0 border-b-0' :
                position === 'bottom' ? 'top-0 -mt-1 left-1/2 -ml-1 border-l-0 border-b-0' :
                'right-0 -mr-1 top-1/2 -mt-1 border-l-0 border-t-0'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
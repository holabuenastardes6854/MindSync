'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type VisualizationType = 'bars' | 'wave' | 'circles' | 'particles';

interface MusicVisualizationProps {
  isPlaying: boolean;
  visualizationType?: VisualizationType;
  audioData?: Uint8Array;
  className?: string;
  color?: string;
  secondaryColor?: string;
  sensitivity?: number;
  showLabel?: boolean;
  sessionType?: 'focus' | 'relax' | 'sleep';
}

export function MusicVisualization({
  isPlaying,
  visualizationType = 'bars',
  audioData,
  className,
  color,
  secondaryColor,
  sensitivity = 1,
  showLabel = false,
  sessionType,
}: MusicVisualizationProps) {
  const [simulated, setSimulated] = useState<number[]>([]);
  const animationRef = useRef<number>(0);
  
  // Colors based on session type or defaults
  const primaryColor = color || (
    sessionType === 'focus' ? 'rgba(59, 130, 246, 0.8)' : // blue
    sessionType === 'relax' ? 'rgba(16, 185, 129, 0.8)' : // green
    sessionType === 'sleep' ? 'rgba(99, 102, 241, 0.8)' : // indigo
    'rgba(139, 92, 246, 0.8)' // purple (default)
  );
  
  const secondColor = secondaryColor || (
    sessionType === 'focus' ? 'rgba(59, 130, 246, 0.3)' : 
    sessionType === 'relax' ? 'rgba(16, 185, 129, 0.3)' : 
    sessionType === 'sleep' ? 'rgba(99, 102, 241, 0.3)' : 
    'rgba(139, 92, 246, 0.3)'
  );

  // Generate simulated audio data when no real data is provided
  useEffect(() => {
    if (!audioData && isPlaying) {
      const simulateAudio = () => {
        const newData = Array(20).fill(0).map(() => {
          // Create somewhat natural-looking values that vary with time
          return Math.floor(
            10 + (Math.sin(Date.now() / 500) * 10) + 
            (Math.random() * 20 * sensitivity)
          );
        });
        setSimulated(newData);
        animationRef.current = requestAnimationFrame(simulateAudio);
      };
      
      simulateAudio();
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [audioData, isPlaying, sensitivity]);

  // Convert audioData to standard array if present, or use simulated data
  const displayData: number[] = audioData 
    ? Array.from(audioData) 
    : simulated;
  
  // Normalize data for visualization (values between 0-100)
  const normalizedData: number[] = displayData.map(val => 
    Math.min(Math.max((val * sensitivity), 5), 100)
  );

  // Function to render different visualization types
  const renderVisualization = () => {
    switch(visualizationType) {
      case 'bars':
        return (
          <div className="flex items-end justify-center h-full gap-[2px] px-1">
            {normalizedData.map((value, index) => (
              <motion.div
                key={index}
                className="w-[3px] sm:w-1 rounded-t"
                animate={{ 
                  height: isPlaying ? `${value}%` : '10%',
                  opacity: isPlaying ? 1 : 0.5,
                  backgroundColor: primaryColor
                }}
                initial={{ height: '10%', opacity: 0.5 }}
                transition={{ 
                  duration: 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
        
      case 'wave':
        return (
          <div className="h-full w-full overflow-hidden flex items-center">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <motion.polyline
                points={normalizedData.map((value, index) => {
                  const x = (index / (normalizedData.length - 1)) * 100;
                  const y = 50 - (value / 4); // Center the wave
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ 
                  strokeWidth: 1,
                  stroke: secondColor,
                  opacity: 0.5
                }}
                animate={{ 
                  stroke: primaryColor,
                  strokeWidth: isPlaying ? 2 : 1,
                  opacity: isPlaying ? 1 : 0.5
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Mirrored wave for effect */}
              <motion.polyline
                points={normalizedData.map((value, index) => {
                  const x = (index / (normalizedData.length - 1)) * 100;
                  const y = 50 + (value / 4); // Mirror below center
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ 
                  strokeWidth: 1,
                  stroke: secondColor,
                  opacity: 0.3
                }}
                animate={{ 
                  stroke: secondColor,
                  strokeWidth: isPlaying ? 1.5 : 1,
                  opacity: isPlaying ? 0.6 : 0.3
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </div>
        );
        
      case 'circles':
        const maxValue = Math.max(...normalizedData);
        return (
          <div className="flex justify-center items-center h-full">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                initial={{ 
                  width: 20 + (i * 20),
                  height: 20 + (i * 20),
                  opacity: 0.7 - (i * 0.2),
                  backgroundColor: secondColor
                }}
                animate={{
                  width: isPlaying 
                    ? 40 + (i * 30) + (maxValue / 4)
                    : 20 + (i * 20),
                  height: isPlaying 
                    ? 40 + (i * 30) + (maxValue / 4)
                    : 20 + (i * 20),
                  opacity: isPlaying ? (0.8 - (i * 0.2)) : (0.5 - (i * 0.15)),
                  backgroundColor: i === 0 ? primaryColor : secondColor
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
        
      case 'particles':
        return (
          <div className="relative h-full w-full flex justify-center items-center overflow-hidden">
            {normalizedData.slice(0, 12).map((value, index) => {
              const angleDeg = (index / 12) * 360;
              const distance = 15 + (value / 2);
              
              return (
                <motion.div
                  key={index}
                  className="absolute rounded-full w-2 h-2"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0.3,
                    backgroundColor: secondColor
                  }}
                  animate={{
                    x: isPlaying ? Math.cos(angleDeg * Math.PI / 180) * distance : 0,
                    y: isPlaying ? Math.sin(angleDeg * Math.PI / 180) * distance : 0,
                    opacity: isPlaying ? 0.6 + (value / 200) : 0.3,
                    backgroundColor: isPlaying ? primaryColor : secondColor,
                    scale: isPlaying ? 1 + (value / 100) : 1
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </div>
        );
        
      default:
        return <div>No visualization selected</div>;
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-16 overflow-hidden rounded-md",
        className
      )}
    >
      {renderVisualization()}
      
      {showLabel && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-400 opacity-80">
            Press play to start
          </span>
        </div>
      )}
    </div>
  );
}

// Preset variations for different visualization types
export function BarsVisualization(props: Omit<MusicVisualizationProps, 'visualizationType'>) {
  return <MusicVisualization visualizationType="bars" {...props} />;
}

export function WaveVisualization(props: Omit<MusicVisualizationProps, 'visualizationType'>) {
  return <MusicVisualization visualizationType="wave" {...props} />;
}

export function CirclesVisualization(props: Omit<MusicVisualizationProps, 'visualizationType'>) {
  return <MusicVisualization visualizationType="circles" {...props} />;
}

export function ParticlesVisualization(props: Omit<MusicVisualizationProps, 'visualizationType'>) {
  return <MusicVisualization visualizationType="particles" {...props} />;
} 
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Import our custom components
import { IconButton, PlayButton, SkipButton, VolumeButton } from '@/components/ui/IconButton';
import { SessionTimer } from '@/components/music/SessionTimer';
import { MusicVisualization, WaveVisualization } from '@/components/music/MusicVisualization';
import { FadeIn } from '@/components/ui/FadeIn';
import { AnimatedText } from '@/components/ui/AnimatedText';

interface EnhancedPlayerProps {
  sessionType: 'focus' | 'relax' | 'sleep';
  trackTitle: string;
  duration: number; // in minutes
  artist?: string;
  coverImage?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
  initialVolume?: number;
  compact?: boolean;
}

export function EnhancedPlayer({
  sessionType,
  trackTitle,
  duration,
  artist = 'MindSync',
  coverImage,
  onComplete,
  onSkip,
  className,
  initialVolume = 80,
  compact = false
}: EnhancedPlayerProps) {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  // Default cover images for each session type
  const defaultCoverImages = {
    focus: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop',
    relax: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?q=80&w=300&auto=format&fit=crop',
    sleep: 'https://images.unsplash.com/photo-1534695372029-ef47186956e8?q=80&w=300&auto=format&fit=crop',
  };
  
  // Colors for each session type
  const sessionColors = {
    focus: '#3B82F6', // blue
    relax: '#10B981', // green
    sleep: '#6366F1', // indigo
  };
  
  // Session-specific styling
  const color = sessionColors[sessionType];
  const coverSrc = coverImage || defaultCoverImages[sessionType];
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle skip button click
  const handleSkip = () => {
    if (onSkip) onSkip();
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle session completion
  const handleSessionComplete = () => {
    setIsPlaying(false);
    if (onComplete) onComplete();
  };
  
  // Toggle compact/expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <FadeIn direction="up" className={cn('w-full', className)}>
      <motion.div 
        className={cn(
          'relative bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-800',
          isExpanded ? 'p-5' : 'p-3'
        )}
        layout
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Expandable session info */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="flex mb-4 items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Cover image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4 shrink-0">
                <img 
                  src={coverSrc}
                  alt={trackTitle}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                />
                
                {/* Session type indicator */}
                <div 
                  className="absolute bottom-1 left-1 px-2 py-0.5 text-[10px] font-medium rounded-full text-white"
                  style={{ backgroundColor: color }}
                >
                  {sessionType}
                </div>
              </div>
              
              {/* Track info */}
              <div className="flex-1 min-w-0">
                <AnimatedText 
                  text={trackTitle} 
                  effect="fade" 
                  className="text-lg font-semibold text-white truncate"
                />
                <AnimatedText 
                  text={artist} 
                  effect="fade"
                  delay={0.2}
                  className="text-sm text-gray-400 truncate"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main player controls area */}
        <div className="flex items-center gap-3">
          {/* Timer with progress */}
          <div className="mr-2">
            <SessionTimer 
              duration={duration}
              isPlaying={isPlaying}
              onComplete={handleSessionComplete}
              size={isExpanded ? "md" : "sm"}
              color={color}
              showProgressCircle
            />
          </div>
          
          {/* Player controls */}
          <div className="flex flex-1 items-center gap-2">
            <PlayButton 
              isActive={isPlaying}
              onClick={handlePlayPause}
              animation="scale"
              variant="glow"
              size={isExpanded ? "md" : "sm"}
              activeColor={color}
            />
            
            <SkipButton 
              onClick={handleSkip}
              size={isExpanded ? "sm" : "xs"}
              animation="none"
            />
            
            {/* Audio visualization */}
            <div className="flex-1 px-1 h-12">
              <WaveVisualization 
                isPlaying={isPlaying}
                sessionType={sessionType}
                sensitivity={1.2}
                className="rounded-lg overflow-hidden"
              />
            </div>
            
            {/* Volume control */}
            <div className="flex items-center">
              <VolumeButton 
                isActive={!isMuted}
                onClick={handleMuteToggle}
                size={isExpanded ? "sm" : "xs"}
              />
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 80, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-1"
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Expand/collapse button */}
            <IconButton
              icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
              variant="ghost"
              size="xs"
              onClick={toggleExpanded}
              className="ml-1"
            />
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </FadeIn>
  );
} 
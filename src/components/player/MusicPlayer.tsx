'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPlayerProps {
  trackTitle: string;
  category: string;
  duration: number; // in minutes
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: () => void;
  onVolumeChange: (volume: number) => void;
  onSessionEnd: () => void;
}

export default function MusicPlayer({
  trackTitle,
  category,
  duration,
  isPlaying,
  onPlayPause,
  onSkip,
  onVolumeChange,
  onSessionEnd,
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [remainingTime, setRemainingTime] = useState(duration * 60); // convert to seconds
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start/stop timer based on play state
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          // Update the progress every second (0-100)
          return Math.min(newTime, duration * 60);
        });
        
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Session ended
            clearInterval(timerRef.current!);
            onSessionEnd();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, duration, onSessionEnd]);
  
  // Format remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(
    (currentTime / (duration * 60)) * 100,
    100
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mt-8 border border-gray-700 shadow-xl backdrop-blur-sm"
    >
      {/* Header with track info */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.h3 
            className="text-2xl font-bold text-white mb-1"
            whileHover={{ scale: 1.02 }}
          >
            {trackTitle}
          </motion.h3>
          <div className="flex items-center text-gray-400 text-sm">
            <Icon icon="lucide:music" className="mr-1 w-4 h-4" />
            <span>{category}</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-inner border border-gray-600/50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <Icon icon="lucide:clock" className="w-4 h-4 mr-2 text-purple-400" />
          <span className="text-sm font-semibold">{formatTime(remainingTime)}</span>
        </motion.div>
      </div>
      
      {/* Visualizer */}
      <motion.div 
        className="relative h-32 mb-8 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 shadow-inner"
        initial={{ opacity: 0, scaleY: 0.8 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isPlaying ? (
            <div className="w-full h-full flex items-end justify-center px-2">
              <div className="w-full h-full flex items-end space-x-1">
                {Array.from({ length: 60 }).map((_, i) => {
                  // Complex animation based on position
                  const isActive = i % 3 === 0;
                  const baseHeight = isActive ? 70 : 40;
                  const height = Math.sin(Date.now() / 1000 + i * 0.2) * 15 + baseHeight;
                  return (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-t ${
                        i % 5 === 0 ? 'bg-purple-500' : 
                        i % 4 === 0 ? 'bg-blue-500' : 
                        i % 3 === 0 ? 'bg-indigo-500' : 
                        'bg-violet-500'
                      }`}
                      style={{ 
                        height: `${Math.max(5, isPlaying ? height : 10)}%`,
                        opacity: isPlaying ? (Math.random() * 0.4 + 0.6) : 0.3
                      }}
                      animate={isPlaying ? {
                        height: [`${height}%`, `${Math.max(5, height + Math.random() * 30 - 15)}%`],
                        opacity: [0.6, Math.random() * 0.4 + 0.6]
                      } : {}}
                      transition={{
                        duration: isPlaying ? Math.random() * 1 + 0.5 : 0,
                        repeat: isPlaying ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <motion.p 
              className="text-gray-500 text-sm font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              Player paused
            </motion.p>
          )}
        </div>
      </motion.div>
      
      {/* Progress bar */}
      <div className="relative h-2 w-full bg-gray-700/50 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
          style={{ width: `${progressPercentage}%` }}
          animate={isPlaying ? {
            boxShadow: ["0 0 5px rgba(147, 51, 234, 0.5)", "0 0 15px rgba(147, 51, 234, 0.7)"],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Time markers */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration * 60)}</span>
        </div>
      </div>
      
      {/* Playback controls */}
      <div className="flex items-center justify-between mt-10">
        <div className="flex items-center">
          <motion.button
            onClick={onPlayPause}
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glowing background */}
            <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-md"></div>
            
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full text-white relative z-10 shadow-lg">
              <Icon icon={isPlaying ? 'lucide:pause' : 'lucide:play'} className="w-7 h-7" />
            </div>
          </motion.button>
          
          <motion.button
            onClick={onSkip}
            className="ml-5 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-gray-200 transition-colors shadow-md">
              <Icon icon="lucide:skip-forward" className="w-5 h-5" />
            </div>
          </motion.button>
        </div>
        
        <div className="relative">
          <motion.button
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-full shadow-md"
          >
            <Icon icon={
              volume > 60 ? "lucide:volume-2" :
              volume > 20 ? "lucide:volume-1" :
              volume > 0 ? "lucide:volume" : "lucide:volume-x"
            } className="text-gray-300 w-5 h-5" />
            <span className="text-sm text-gray-300">{volume}%</span>
          </motion.button>
          
          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div 
                className="absolute right-0 bottom-14 bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700 w-48"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 rounded-full appearance-none bg-gray-700 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
} 
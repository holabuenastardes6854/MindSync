'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '@clerk/nextjs';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import Visualizer from '@/components/music/Visualizer';
import DurationSelector from '@/components/music/DurationSelector';
import CategorySelector from '@/components/music/CategorySelector';
import Navbar from '@/components/layout/Navbar';

// Mock audio tracks for demonstration
const mockTracks = [
  {
    id: 'focus-1',
    url: 'https://storage.googleapis.com/mindsync-audio/focus/deep-focus-1.mp3',
    title: 'Deep Focus',
    category: 'focus',
    duration: 180,
    requiresPremium: false
  },
  {
    id: 'relax-1',
    url: 'https://storage.googleapis.com/mindsync-audio/relax/calm-meditation-1.mp3',
    title: 'Calm Meditation',
    category: 'relax',
    duration: 180,
    requiresPremium: false
  },
  {
    id: 'sleep-1',
    url: 'https://storage.googleapis.com/mindsync-audio/sleep/deep-sleep-1.mp3',
    title: 'Deep Sleep',
    category: 'sleep',
    duration: 180,
    requiresPremium: false
  },
  {
    id: 'focus-premium',
    url: 'https://storage.googleapis.com/mindsync-audio/focus/premium-focus-1.mp3',
    title: 'Premium Focus',
    category: 'focus',
    duration: 180,
    requiresPremium: true
  }
] as const;

export default function PlayerPage() {
  // Authentication (with isLoaded to prevent hydration issues)
  const { isSignedIn, isLoaded } = useAuth();
  
  // Player state
  const [category, setCategory] = useState<'focus' | 'relax' | 'sleep'>('focus');
  const [sessionDuration, setSessionDuration] = useState<number>(30);
  const [isPremium, setIsPremium] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [sessionTimerInterval, setSessionTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Audio player hook
  const {
    isPlaying,
    track,
    togglePlay,
    loadTrack,
    setVolume,
    volume,
    frequencyData,
    formatTime,
    currentTime,
    duration,
  } = useAudioPlayer();
  
  // Fetch user subscription status
  useEffect(() => {
    // Only fetch if authentication is loaded and user is signed in
    if (!isLoaded || !isSignedIn) return;
    
    // This would be a real API call in production
    const fetchSubscription = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock response - in production this would be a real API call
        setIsPremium(false);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    
    fetchSubscription();
  }, [isSignedIn, isLoaded]);
  
  // Start/stop session
  const toggleSession = () => {
    if (sessionActive) {
      // Stop session
      if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
        setSessionTimerInterval(null);
      }
      setSessionActive(false);
      togglePlay(); // Pause audio
    } else {
      // Start session
      setSessionTimeRemaining(sessionDuration * 60); // Convert to seconds
      
      // Find a track for the selected category
      const availableTracks = mockTracks.filter(t => 
        t.category === category && (!t.requiresPremium || isPremium)
      );
      
      if (availableTracks.length > 0) {
        // Load and play the first available track
        loadTrack(availableTracks[0]);
        
        // Start session timer
        const interval = setInterval(() => {
          setSessionTimeRemaining(prev => {
            if (prev <= 1) {
              // Session ended
              clearInterval(interval);
              setSessionActive(false);
              togglePlay(); // Pause audio
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setSessionTimerInterval(interval);
        setSessionActive(true);
        
        // Ensure audio is playing
        if (!isPlaying) {
          togglePlay();
        }
      }
    }
  };
  
  // Format session remaining time
  const formatSessionTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate session progress percentage
  const sessionProgress = sessionActive
    ? 100 - ((sessionTimeRemaining / (sessionDuration * 60)) * 100)
    : 0;
  
  // UI animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
      }
    };
  }, [sessionTimerInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto max-w-5xl px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" 
          className="space-y-10"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              MindSync <span className="text-purple-500">Player</span>
            </h1>
            <div className="text-sm text-gray-400">
              {isLoaded && isSignedIn ? (
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isPremium ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>{isPremium ? 'Premium Account' : 'Free Account'}</span>
                </div>
              ) : (
                <span>Sign in to save your sessions</span>
              )}
            </div>
          </motion.div>
          
          {/* Category Selector */}
          <motion.div variants={itemVariants}>
            <CategorySelector 
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </motion.div>
          
          {/* Duration Selector */}
          <motion.div variants={itemVariants}>
            <DurationSelector
              selectedDuration={sessionDuration}
              onSelectDuration={setSessionDuration}
              isPremium={isPremium}
            />
          </motion.div>
          
          {/* Player Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700"
          >
            {/* Track Info */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {track?.title || `${category.charAt(0).toUpperCase() + category.slice(1)} Session`}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {track ? formatTime(currentTime) + ' / ' + formatTime(duration) : 'No track loaded'}
                </p>
              </div>
              <div className="flex items-center bg-gray-700/50 px-4 py-2 rounded-full">
                <Icon icon="heroicons:clock" className="text-purple-400 mr-2" width={16} />
                <span className="font-medium">
                  {sessionActive 
                    ? formatSessionTime(sessionTimeRemaining) 
                    : formatSessionTime(sessionDuration * 60)}
                </span>
              </div>
            </div>
            
            {/* Visualizer */}
            <div className="mb-6">
              <Visualizer 
                frequencyData={frequencyData}
                isPlaying={isPlaying}
                activeColor={
                  category === 'focus' ? '#60a5fa' :  // blue
                  category === 'relax' ? '#4ade80' :  // green
                  '#a78bfa'                           // purple
                }
              />
            </div>
            
            {/* Session Progress */}
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0:00</span>
                <span>{formatSessionTime(sessionDuration * 60)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center items-center mt-8">
              <motion.button
                onClick={toggleSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-full w-16 h-16 shadow-lg"
              >
                <Icon 
                  icon={sessionActive ? "heroicons:pause" : "heroicons:play"} 
                  width={30} 
                  className="text-white"
                />
              </motion.button>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center justify-center mt-6">
              <Icon icon="heroicons:speaker-wave" className="text-gray-400 mr-2" width={16} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-40 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs ml-2">{volume}%</span>
            </div>
          </motion.div>
          
          {/* Session Info Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800/60 p-6 rounded-xl border border-gray-700/50"
          >
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Icon icon="heroicons:information-circle" className="text-purple-400 mr-2" width={20} />
              About {category.charAt(0).toUpperCase() + category.slice(1)} Sessions
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {category === 'focus' && 
                'Focus sessions use specific sound frequencies that enhance concentration and productivity. The neural phase locking technology helps maintain attention for longer periods.'}
              {category === 'relax' && 
                'Relaxation sessions use scientifically-designed soundscapes to reduce stress and anxiety. Regular sessions can help lower cortisol levels and improve overall well-being.'}
              {category === 'sleep' && 
                'Sleep sessions feature frequency patterns that guide your brain toward deeper sleep states. The neural oscillations promote faster sleep onset and more restful sleep patterns.'}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 
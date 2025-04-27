'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import SessionTypeSelector from '@/components/music/SessionTypeSelector';
import DurationPicker from '@/components/music/DurationPicker';
import MusicCategoryGrid from '@/components/music/MusicCategoryGrid';
import MusicPlayer from '@/components/player/MusicPlayer';
import SessionFeedback from '@/components/feedback/SessionFeedback';
import { Icon } from '@iconify/react';

// Types
type SessionType = 'focus' | 'relax' | 'sleep';
type DurationOption = 15 | 30 | 45 | 60 | 120;

interface MusicCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isPremium: boolean;
}

export default function DashboardPage() {
  // State management
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [duration, setDuration] = useState<DurationOption>(30);
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handlers
  const handleCategorySelect = (category: MusicCategory) => {
    setSelectedCategory(category);
    // Simulate loading the music
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);
    }, 1000);
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSkip = () => {
    // Simulate loading the next track
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);
    }, 800);
  };
  
  const handleVolumeChange = (volume: number) => {
    // In a real app, this would change the volume
    console.log('Volume changed to:', volume);
  };
  
  const handleSessionEnd = () => {
    setIsPlaying(false);
    setSessionCompleted(true);
    setShowFeedback(true);
  };
  
  const handleFeedbackSubmit = (rating: number, comment: string) => {
    // In a real app, this would send feedback to the server
    console.log('Feedback submitted:', { rating, comment });
    setShowFeedback(false);
    setSessionCompleted(false);
    setSelectedCategory(null);
  };
  
  const handleFeedbackSkip = () => {
    setShowFeedback(false);
    setSessionCompleted(false);
    setSelectedCategory(null);
  };
  
  // Framer Motion variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { opacity: 0 }
  };
  
  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950"
    >
      <Navbar />
      <Sidebar />
      
      <main className="pt-20 md:pl-64 p-4 md:p-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-10"
          >
            <Icon icon="fluent-emoji-high-contrast:musical-notes" className="w-10 h-10 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">
              Your Brain <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Sessions</span>
            </h1>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-64"
              >
                <motion.div 
                  className="w-16 h-16 border-4 border-t-purple-500 border-gray-700 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-6 text-gray-400 text-lg">Preparing your session...</p>
              </motion.div>
            ) : (
              <>
                {/* Session configuration section */}
                {!selectedCategory && !sessionCompleted && (
                  <motion.div
                    key="selector"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SessionTypeSelector 
                      selected={sessionType} 
                      onSelect={setSessionType} 
                    />
                    
                    <DurationPicker 
                      selected={duration} 
                      onSelect={setDuration}
                    />
                    
                    <MusicCategoryGrid 
                      sessionType={sessionType} 
                      onSelect={handleCategorySelect}
                    />
                  </motion.div>
                )}
                
                {/* Music player section */}
                {selectedCategory && !showFeedback && (
                  <motion.div
                    key="player"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MusicPlayer
                      trackTitle={selectedCategory.title}
                      category={sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
                      duration={duration}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      onSkip={handleSkip}
                      onVolumeChange={handleVolumeChange}
                      onSessionEnd={handleSessionEnd}
                    />
                    
                    <motion.div 
                      className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Icon icon="lucide:brain" className="mr-2 text-purple-400" />
                        Session Benefits
                      </h3>
                      <p className="text-gray-300">
                        {sessionType === 'focus' && 'This focus music is specially designed to enhance your concentration and productivity. The neural phase locking technology helps maintain attention for longer periods.'}
                        {sessionType === 'relax' && 'This relaxation session uses scientifically-designed soundscapes to reduce stress and anxiety. Regular sessions can help lower cortisol levels.'}
                        {sessionType === 'sleep' && 'This sleep music features frequency patterns that guide your brain toward deeper sleep states. The neural oscillations promote faster sleep onset.'}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* Feedback section */}
                {showFeedback && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SessionFeedback 
                      onSubmit={handleFeedbackSubmit}
                      onSkip={handleFeedbackSkip}
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
} 
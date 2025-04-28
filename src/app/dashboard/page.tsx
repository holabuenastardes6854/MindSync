'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import SessionTypeSelector from '@/components/music/SessionTypeSelector';
import DurationSelector from '@/components/music/DurationSelector';
import MusicCategoryGrid from '@/components/music/MusicCategoryGrid';
import { FadeIn, FadeInUp } from '@/components/ui/FadeIn';
import { StrongParallax } from '@/components/ui/Parallax';
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
  // User and subscription state
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  
  // Session configuration state
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [duration, setDuration] = useState<DurationOption>(30);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading and check premium status
  useEffect(() => {
    if (isLoaded) {
      // Simulate API call to fetch subscription status
      const checkPremiumStatus = async () => {
        try {
          // This would be a real API call in production
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // For demo, randomly assign premium status
          setIsPremium(Math.random() > 0.5);
          setIsLoading(false);
        } catch (error) {
          console.error('Error checking premium status:', error);
          setIsLoading(false);
        }
      };
      
      checkPremiumStatus();
    }
  }, [isLoaded]);
  
  // Handler for starting a session
  const handleStartSession = (category: MusicCategory) => {
    // In a real app, this would navigate to the player or prepare the session
    window.location.href = `/player?type=${sessionType}&duration=${duration}&category=${category.id}`;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Navbar />
      <Sidebar />
      
      <main className="pt-24 md:pl-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <FadeInUp className="mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome {user?.firstName ? `, ${user.firstName}` : ''}
                </h1>
                <p className="text-gray-400 max-w-xl">
                  Choose a music style that matches your current needs and enhance your mental state.
                </p>
              </div>
              
              <StrongParallax className="mt-4 md:mt-0">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-lg backdrop-blur-sm border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-md">
                      <Icon icon={isPremium ? "ph:crown-fill" : "ph:star"} className={isPremium ? "text-yellow-400" : "text-gray-400"} width={24} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {isPremium ? 'Premium Account' : 'Free Account'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {isPremium 
                          ? 'All features unlocked' 
                          : <Link href="/pricing" className="text-purple-400 hover:text-purple-300">Upgrade for more options</Link>}
                      </p>
                    </div>
                  </div>
                </div>
              </StrongParallax>
            </div>
          </FadeInUp>
          
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
                <p className="mt-6 text-gray-400 text-lg">Loading your personalized experience...</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Session Type Selector */}
                <motion.div variants={itemVariants} className="mb-10">
                  <h2 className="text-xl font-semibold text-white mb-4">What do you want to achieve?</h2>
                  <SessionTypeSelector 
                    selected={sessionType} 
                    onSelect={setSessionType} 
                  />
                </motion.div>
                
                {/* Duration Selector */}
                <motion.div variants={itemVariants} className="mb-10">
                  <DurationSelector 
                    selectedDuration={duration} 
                    onSelectDuration={(value) => setDuration(value as DurationOption)}
                    isPremium={isPremium}
                  />
                </motion.div>
                
                {/* Music Categories */}
                <motion.div variants={itemVariants}>
                  <MusicCategoryGrid 
                    sessionType={sessionType} 
                    onSelect={handleStartSession}
                  />
                </motion.div>
                
                {/* Quick Start - Recently Played */}
                <motion.div 
                  variants={itemVariants}
                  className="mt-16 mb-8"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">Recently Played</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-md">
                          <Icon icon="lucide:brain" className="text-blue-400" width={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Deep Focus</h3>
                          <p className="text-gray-400 text-sm">30 min · Played yesterday</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <div className="bg-purple-600 rounded-full p-2 hover:bg-purple-500 transition-colors">
                          <Icon icon="lucide:play" className="text-white" width={14} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500/20 p-2 rounded-md">
                          <Icon icon="lucide:sparkles" className="text-green-400" width={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Evening Relaxation</h3>
                          <p className="text-gray-400 text-sm">60 min · Played 2 days ago</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <div className="bg-purple-600 rounded-full p-2 hover:bg-purple-500 transition-colors">
                          <Icon icon="lucide:play" className="text-white" width={14} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-500/20 p-2 rounded-md">
                          <Icon icon="lucide:moon" className="text-indigo-400" width={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Deep Sleep</h3>
                          <p className="text-gray-400 text-sm">8 hours · Played 3 days ago</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <div className="bg-purple-600 rounded-full p-2 hover:bg-purple-500 transition-colors">
                          <Icon icon="lucide:play" className="text-white" width={14} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { FadeIn } from '@/components/ui/FadeIn';

export default function TestPage() {
  // Alert handlers for each section
  const handleFocusClick = () => {
    alert('Focus section clicked');
  };
  
  const handleRelaxClick = () => {
    alert('Relax section clicked');
  };
  
  const handleSleepClick = () => {
    alert('Sleep section clicked');
  };
  
  const handleMeditateClick = () => {
    alert('Meditate section clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex flex-col p-6 relative">
      <FadeIn>
        <div className="max-w-6xl mx-auto mt-16 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Focus Section - Large Card */}
            <motion.div
              className="aspect-square relative rounded-3xl overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFocusClick}
            >
              <div className="absolute inset-0 bg-purple-600/30 rounded-3xl" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-4xl font-bold text-white mb-2">Focus</h2>
                <div className="relative h-[200px] w-[200px] md:h-[300px] md:w-[300px] mx-auto">
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-purple-600/40 to-transparent rounded-full blur-2xl" 
                       style={{ width: '80%', height: '80%', top: '10%', left: '10%' }} />
                  <Icon 
                    icon="fluent-emoji:man-technologist" 
                    className="w-full h-full" 
                  />
                </div>
              </div>
            </motion.div>
            
            <div className="flex flex-col gap-4">
              {/* Relax Section */}
              <motion.div
                className="aspect-[2/1] relative rounded-3xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRelaxClick}
              >
                <div className="absolute inset-0 bg-blue-600/30 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-between p-8">
                  <h2 className="text-4xl font-bold text-white">Relax</h2>
                  <div className="relative h-[100px] w-[100px]">
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-blue-600/40 to-transparent rounded-full blur-xl"
                         style={{ width: '80%', height: '80%', top: '10%', left: '10%' }} />
                    <Icon
                      icon="fluent-emoji:person-in-lotus-position"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Sleep Section */}
              <motion.div
                className="aspect-[2/1] relative rounded-3xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSleepClick}
              >
                <div className="absolute inset-0 bg-indigo-600/30 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-between p-8">
                  <h2 className="text-4xl font-bold text-white">Sleep</h2>
                  <div className="relative h-[100px] w-[100px]">
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-indigo-600/40 to-transparent rounded-full blur-xl"
                         style={{ width: '80%', height: '80%', top: '10%', left: '10%' }} />
                    <Icon
                      icon="fluent-emoji:person-in-bed"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Meditate Section */}
              <motion.div
                className="aspect-[2/1] relative rounded-3xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMeditateClick}
              >
                <div className="absolute inset-0 bg-green-600/30 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-between p-8">
                  <h2 className="text-4xl font-bold text-white">Meditate</h2>
                  <div className="relative h-[100px] w-[100px]">
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-green-600/40 to-transparent rounded-full blur-xl"
                         style={{ width: '80%', height: '80%', top: '10%', left: '10%' }} />
                    <Icon
                      icon="fluent-emoji:person-meditating"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </FadeIn>
      
      {/* Player bar at bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl"
      >
        <div className="bg-gray-800/70 backdrop-blur-md rounded-full p-3 px-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-purple-600/20">
              <Icon icon="ph:music-notes" className="w-full h-full text-purple-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Light as a Feather</p>
              <p className="text-gray-400 text-xs">Piano</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-gray-400 text-sm">∞ 4:45</div>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Icon icon="ph:play-fill" className="text-gray-900 w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Jump back button */}
      <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2">
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ y: 2 }}
          className="bg-gray-800/70 backdrop-blur-md text-white px-6 py-2 rounded-full flex items-center space-x-2 border border-gray-700/50"
        >
          <span>JUMP BACK IN</span>
          <Icon icon="ph:caret-down" />
        </motion.button>
      </div>
    </div>
  );
} 
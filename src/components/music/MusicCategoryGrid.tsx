'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface MusicCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isPremium: boolean;
}

const musicCategories: MusicCategory[] = [
  {
    id: 'deep-work',
    title: 'Deep Work',
    description: 'Enhanced focus for complex tasks',
    imageUrl: '/images/categories/deep-work.jpg',
    isPremium: false,
  },
  {
    id: 'flow-state',
    title: 'Flow State',
    description: 'Get in the zone and stay there',
    imageUrl: '/images/categories/flow-state.jpg',
    isPremium: false,
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Guided mindfulness sessions',
    imageUrl: '/images/categories/meditation.jpg',
    isPremium: true,
  },
  {
    id: 'power-nap',
    title: 'Power Nap',
    description: 'Rejuvenating short sleep',
    imageUrl: '/images/categories/power-nap.jpg',
    isPremium: true,
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Background sounds for better retention',
    imageUrl: '/images/categories/reading.jpg',
    isPremium: false,
  },
  {
    id: 'creativity',
    title: 'Creativity',
    description: 'Unlock your creative potential',
    imageUrl: '/images/categories/creativity.jpg',
    isPremium: true,
  },
];

interface MusicCategoryGridProps {
  onSelect: (category: MusicCategory) => void;
  sessionType: 'focus' | 'relax' | 'sleep';
}

export default function MusicCategoryGrid({ onSelect, sessionType }: MusicCategoryGridProps) {
  // Filter categories based on session type - in a real app, this would come from the backend
  const filteredCategories = musicCategories;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const getIconForCategory = (id: string) => {
    switch(id) {
      case 'deep-work': return 'lucide:brain';
      case 'flow-state': return 'lucide:zap';
      case 'meditation': return 'lucide:heart';
      case 'power-nap': return 'lucide:moon';
      case 'reading': return 'lucide:book-open';
      default: return 'lucide:palette';
    }
  };
  
  return (
    <motion.div 
      className="mt-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="text-2xl text-white font-semibold mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Select a Category
      </motion.h3>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            whileHover={{ 
              y: -5, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.button
              onClick={() => onSelect(category)}
              className="w-full h-full group bg-gray-800/80 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 border border-gray-700 shadow-lg hover:shadow-xl"
            >
              <div className="relative h-40 w-full overflow-hidden">
                {/* Animated gradient background */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-blue-600/30"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear'
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
                
                {/* Icon animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Icon 
                      icon={getIconForCategory(category.id)}
                      className="w-16 h-16 text-white/70 group-hover:text-white/90 transition-colors drop-shadow-lg" 
                    />
                  </motion.div>
                </div>
                
                {/* Premium badge */}
                {category.isPremium && (
                  <motion.div 
                    className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-xs text-gray-900 font-bold py-1 px-3 rounded-full shadow-lg"
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: 0,
                      transition: { delay: 0.2, duration: 0.3 }
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotate: [0, -5, 0, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <span className="flex items-center">
                      <Icon icon="lucide:star" className="w-3 h-3 mr-1" />
                      PREMIUM
                    </span>
                  </motion.div>
                )}
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-5">
                <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{category.title}</h4>
                <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">{category.description}</p>
                
                {/* Play button indicator on hover */}
                <div className="mt-4 flex justify-end">
                  <motion.div 
                    className="w-8 h-8 bg-purple-600/0 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Icon 
                      icon="lucide:play" 
                      className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    />
                  </motion.div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
} 
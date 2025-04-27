'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

type DurationOption = 15 | 30 | 45 | 60 | 120;

const durationOptions: { value: DurationOption; label: string; icon: string }[] = [
  { value: 15, label: '15 min', icon: 'lucide:timer' },
  { value: 30, label: '30 min', icon: 'lucide:timer' },
  { value: 45, label: '45 min', icon: 'lucide:timer' },
  { value: 60, label: '1 hour', icon: 'lucide:clock' },
  { value: 120, label: '2 hours', icon: 'lucide:clock' },
];

interface DurationPickerProps {
  onSelect: (duration: DurationOption) => void;
  selected: DurationOption;
}

export default function DurationPicker({ onSelect, selected }: DurationPickerProps) {
  // Animation variants
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
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="text-xl text-white font-semibold mb-5 flex items-center"
        variants={itemVariants}
      >
        <Icon icon="lucide:clock-4" className="mr-2 text-purple-400" />
        Session Duration
      </motion.h3>
      
      <motion.div 
        className="flex flex-wrap gap-3"
        variants={containerVariants}
      >
        {durationOptions.map((option) => (
          <motion.button
            key={option.value}
            variants={itemVariants}
            whileHover={{ 
              y: -4, 
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option.value)}
            className={`
              px-5 py-3 rounded-xl transition-all duration-300 flex items-center
              ${selected === option.value 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700/80 shadow-md'
              }
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center mr-2
              ${selected === option.value ? 'bg-white/20' : 'bg-gray-700'}
            `}>
              <Icon 
                icon={option.icon} 
                className={`w-4 h-4 ${selected === option.value ? 'text-white' : 'text-gray-400'}`} 
              />
            </div>
            <span className="font-medium">{option.label}</span>
            
            {selected === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
              >
                <Icon icon="lucide:check" className="w-3 h-3 text-purple-600" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>
      
      {/* Scrollable time indicator for visual effect */}
      <motion.div 
        className="mt-6 bg-gray-800/40 rounded-lg p-3 border border-gray-700/50 backdrop-filter backdrop-blur-sm hidden md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="relative h-2 w-full bg-gray-700/30 rounded-full overflow-hidden">
          <motion.div 
            className="absolute h-full bg-purple-600/30 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(selected / 120) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          
          <div className="absolute top-6 left-0 right-0 flex justify-between">
            {[0, 30, 60, 90, 120].map((minutes) => (
              <div key={minutes} className="flex flex-col items-center">
                <div className={`h-3 w-0.5 bg-gray-600 -mt-3 ${selected >= minutes ? 'bg-purple-500' : ''}`} />
                <span className={`text-xs mt-1 ${selected >= minutes ? 'text-purple-400' : 'text-gray-500'}`}>
                  {minutes > 60 ? `${minutes / 60}h` : `${minutes}m`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 
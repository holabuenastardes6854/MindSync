'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Image from 'next/image';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  image: string;
}

interface CategorySelectorProps {
  categories: Category[];
  onSelect: (category: Category) => void;
}

export default function CategorySelector({ categories, onSelect }: CategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="w-full">
      <motion.h2 
        className="text-2xl font-bold text-white mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Choose your enhancement focus
      </motion.h2>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categories.map((category) => {
          const isHovered = hoveredCategory === category.id;
          
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                transition: { duration: 0.2 } 
              }}
              onClick={() => onSelect(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative overflow-hidden rounded-xl cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/50 z-10" />
              
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between">
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}
                  >
                    <Icon icon={category.icon} className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className="ml-3 text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0.7, 
                    y: isHovered ? 0 : 10 
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-300 text-sm"
                >
                  {category.description}
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-between mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`text-sm font-medium ${isHovered ? 'text-white' : 'text-gray-400'}`}>
                    Select
                  </span>
                  
                  <motion.div
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ 
                      x: isHovered ? 0 : -5, 
                      opacity: isHovered ? 1 : 0 
                    }}
                  >
                    <Icon icon="mdi:arrow-right" className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Animated border effect */}
              <motion.div 
                className="absolute inset-0 z-0 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  background: `linear-gradient(90deg, transparent, ${category.color.replace('bg-', 'rgb:').replace('/', ',')}40, transparent)`
                }}
                transition={{ duration: 0.3 }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${category.color.replace('bg-', 'rgb:').replace('/', ',')}40, transparent)`,
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
} 
'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

type Category = 'focus' | 'relax' | 'sleep';

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const categoryInfo = {
  focus: {
    title: 'Focus',
    description: 'Música diseñada para mejorar la concentración y productividad',
    icon: 'heroicons:bolt',
    color: 'from-blue-600 to-blue-400'
  },
  relax: {
    title: 'Relax',
    description: 'Sonidos calmantes para reducir el estrés y la ansiedad',
    icon: 'heroicons:sun',
    color: 'from-green-600 to-green-400'
  },
  sleep: {
    title: 'Sleep',
    description: 'Melodías suaves para facilitar el sueño y descanso profundo',
    icon: 'heroicons:moon',
    color: 'from-indigo-600 to-purple-400'
  }
};

export default function CategorySelector({ 
  selectedCategory,
  onSelectCategory 
}: CategorySelectorProps) {
  const categories: Category[] = ['focus', 'relax', 'sleep'];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Selecciona una Categoría</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            isSelected={selectedCategory === category}
            onClick={() => onSelectCategory(category)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  const { title, description, icon, color } = categoryInfo[category];
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' 
          : 'ring-1 ring-gray-700 hover:ring-gray-500'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-${isSelected ? '20' : '10'}`} />
      
      <div className="relative p-5">
        <div className="flex items-center mb-2">
          <Icon 
            icon={icon} 
            className={`mr-2 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} 
            width={24} 
          />
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        
        <p className="text-sm text-gray-300">{description}</p>
        
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-3"
          >
            <Icon icon="heroicons:check-circle" className="text-purple-500" width={20} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 
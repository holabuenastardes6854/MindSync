'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

type SessionType = 'focus' | 'relax' | 'sleep';

const sessionTypes = [
  {
    id: 'focus',
    name: 'Focus',
    description: 'Boost productivity & concentration',
    icon: 'lucide:brain',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
    glowColor: 'shadow-blue-500/20',
    textColor: 'text-blue-400',
    hoverColor: 'hover:bg-blue-500/10',
  },
  {
    id: 'relax',
    name: 'Relax',
    description: 'Reduce stress & anxiety',
    icon: 'lucide:sparkles',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-500/10',
    glowColor: 'shadow-green-500/20',
    textColor: 'text-green-400',
    hoverColor: 'hover:bg-green-500/10',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Improve sleep quality',
    icon: 'lucide:moon',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-500/10',
    glowColor: 'shadow-indigo-500/20',
    textColor: 'text-indigo-400',
    hoverColor: 'hover:bg-indigo-500/10',
  },
];

interface SessionTypeSelectorProps {
  onSelect: (type: SessionType) => void;
  selected: SessionType;
}

export default function SessionTypeSelector({ onSelect, selected }: SessionTypeSelectorProps) {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="w-full overflow-hidden pb-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex space-x-4 overflow-x-auto py-4 px-2 -mx-2 no-scrollbar"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
      >
        {sessionTypes.map((type) => (
          <motion.button
            key={type.id}
            variants={cardVariants}
            whileHover={{ 
              y: -5, 
              scale: 1.03,
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(type.id as SessionType)}
            className={`
              flex flex-col items-center p-5 rounded-xl transition-all duration-300
              shadow-lg backdrop-blur-sm
              ${selected === type.id 
                ? `bg-gradient-to-br ${type.color} text-white shadow-xl ${type.glowColor}` 
                : `bg-gray-800/80 ${type.textColor} ${type.hoverColor} border border-gray-700`
              }
              w-44 h-40 flex-shrink-0
            `}
          >
            <motion.div 
              className={`rounded-full p-4 ${selected === type.id ? 'bg-white/20' : type.bgColor}`}
              animate={selected === type.id ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3
                }
              } : {}}
            >
              <Icon icon={type.icon} className="w-8 h-8" />
            </motion.div>
            <h3 className="mt-3 font-semibold text-lg">{type.name}</h3>
            <p className={`text-xs mt-1 text-center ${selected === type.id ? 'text-white/90' : 'text-gray-400'}`}>
              {type.description}
            </p>
            
            {/* Decorative elements */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className={`
                absolute -inset-1 opacity-0 
                ${selected === type.id ? 'bg-gradient-to-br ' + type.color + ' opacity-30 blur-xl' : ''}
              `}></div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
} 
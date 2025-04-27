'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '@clerk/nextjs';

// Opciones de duración disponibles (en minutos)
const durationOptions = [
  { value: 15, label: '15 min', requiresPremium: false },
  { value: 30, label: '30 min', requiresPremium: false },
  { value: 60, label: '1 hora', requiresPremium: true },
  { value: 120, label: '2 horas', requiresPremium: true },
  { value: 240, label: '4 horas', requiresPremium: true },
];

interface DurationSelectorProps {
  selectedDuration: number;
  onSelectDuration: (duration: number) => void;
  isPremium: boolean;
}

export default function DurationSelector({
  selectedDuration,
  onSelectDuration,
  isPremium,
}: DurationSelectorProps) {
  const { isSignedIn, isLoaded } = useAuth();

  const handleSelectDuration = (duration: number, requiresPremium: boolean) => {
    // Si requiere premium y el usuario no es premium, no permitir selección
    if (requiresPremium && !isPremium) {
      return;
    }
    
    onSelectDuration(duration);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Duración de la Sesión</h2>
      
      <div className="flex flex-wrap gap-3">
        {durationOptions.map(({ value, label, requiresPremium: required }) => (
          <DurationButton
            key={value}
            duration={value}
            label={label}
            isSelected={selectedDuration === value}
            isDisabled={required && !isPremium}
            isPremium={required}
            isSignedIn={isLoaded ? !!isSignedIn : false}
            onClick={() => handleSelectDuration(value, required)}
          />
        ))}
      </div>
    </div>
  );
}

interface DurationButtonProps {
  duration: number;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  isPremium: boolean;
  isSignedIn: boolean;
  onClick: () => void;
}

function DurationButton({
  label,
  isSelected,
  isDisabled,
  isPremium,
  onClick,
}: DurationButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={isDisabled}
      className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
        isDisabled
          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
          : isSelected
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      <span>{label}</span>
      
      {isPremium && (
        <div 
          className={`ml-2 flex items-center justify-center p-0.5 rounded ${
            isDisabled ? 'text-gray-500' : 'text-yellow-400'
          }`}
        >
          <Icon icon="heroicons:star" width={14} />
        </div>
      )}
      
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-2"
        >
          <Icon icon="heroicons:check" width={16} />
        </motion.div>
      )}
      
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-1 px-2 py-1 rounded bg-gray-800/80">
            <Icon icon="heroicons:lock-closed" className="text-yellow-500" width={12} />
            <span className="text-xs text-yellow-400">Premium</span>
          </div>
        </div>
      )}
    </motion.button>
  );
} 
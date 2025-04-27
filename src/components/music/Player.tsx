'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import Visualizer from './Visualizer';
import type { AudioTrack } from '@/lib/audio/audioService';

// Datos simulados de pistas para la demo
const mockTracks: Record<string, AudioTrack[]> = {
  focus: [
    {
      id: 'focus1',
      title: 'Deep Focus',
      url: 'https://storage.googleapis.com/mindsync-demo/focus1.mp3',
      category: 'focus',
      duration: 180
    },
    {
      id: 'focus2',
      title: 'Concentration Flow',
      url: 'https://storage.googleapis.com/mindsync-demo/focus2.mp3',
      category: 'focus',
      duration: 240,
      requiresPremium: true
    }
  ],
  relax: [
    {
      id: 'relax1',
      title: 'Evening Calm',
      url: 'https://storage.googleapis.com/mindsync-demo/relax1.mp3',
      category: 'relax',
      duration: 200
    },
    {
      id: 'relax2',
      title: 'Ocean Waves',
      url: 'https://storage.googleapis.com/mindsync-demo/relax2.mp3',
      category: 'relax',
      duration: 220,
      requiresPremium: true
    }
  ],
  sleep: [
    {
      id: 'sleep1',
      title: 'Deep Sleep',
      url: 'https://storage.googleapis.com/mindsync-demo/sleep1.mp3',
      category: 'sleep',
      duration: 250
    },
    {
      id: 'sleep2',
      title: 'Night Dreams',
      url: 'https://storage.googleapis.com/mindsync-demo/sleep2.mp3',
      category: 'sleep',
      duration: 300,
      requiresPremium: true
    }
  ]
};

interface PlayerProps {
  category: 'focus' | 'relax' | 'sleep';
  duration: number;
  isPremium: boolean;
  onSessionEnd?: () => void;
}

export default function Player({
  category,
  duration,
  isPremium,
  onSessionEnd
}: PlayerProps) {
  // Estado para controlar la sesión
  const [sessionTime, setSessionTime] = useState(duration * 60); // Convertir minutos a segundos
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<AudioTrack[]>([]);
  
  // Referencias para temporizadores
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Instanciar el hook del reproductor de audio
  const {
    isPlaying,
    currentTime,
    duration: trackDuration,
    volume,
    track,
    loading,
    error,
    frequencyData,
    loadTrack,
    togglePlay,
    seek,
    setVolume,
    formatTime,
    progress
  } = useAudioPlayer();

  // Efecto para cargar pistas disponibles según la categoría
  useEffect(() => {
    // Utilizar pistas de ejemplo
    const tracks = mockTracks[category] || [];
    
    // Filtrar pistas premium si el usuario no es premium
    const filteredTracks = isPremium 
      ? tracks 
      : tracks.filter(track => !track.requiresPremium);
    
    setAvailableTracks(filteredTracks);

    // Cargar la primera pista si hay disponibles
    if (filteredTracks.length > 0) {
      loadTrack(filteredTracks[0]);
    }
  }, [category, isPremium, loadTrack]);

  // Efecto para controlar el temporizador de la sesión
  useEffect(() => {
    if (sessionActive && isPlaying && sessionTime > 0) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev - 1;
          
          // Si el tiempo llega a cero, completar la sesión
          if (newTime <= 0) {
            clearInterval(sessionTimerRef.current!);
            setSessionCompleted(true);
            setSessionActive(false);
            onSessionEnd?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (!isPlaying && sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionActive, isPlaying, sessionTime, onSessionEnd]);

  // Iniciar o pausar la sesión
  const toggleSession = () => {
    if (sessionCompleted) {
      // Reiniciar sesión
      setSessionTime(duration * 60);
      setSessionCompleted(false);
    }
    
    setSessionActive(!sessionActive);
    togglePlay();
  };

  // Formatear el tiempo de sesión restante
  const formatSessionTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      {/* Cabecera del reproductor */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">
            {track?.title || 'Cargando pista...'}
          </h3>
          <p className="text-gray-400 text-sm">
            {category.charAt(0).toUpperCase() + category.slice(1)} • {duration} min
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-gray-300 text-sm">
            {formatSessionTime(sessionTime)}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
      
      {/* Visualizador de audio */}
      <Visualizer 
        frequencyData={frequencyData} 
        isPlaying={isPlaying} 
        activeColor={
          category === 'focus' ? '#3b82f6' : 
          category === 'relax' ? '#10b981' : 
          '#8b5cf6'
        }
      />
      
      {/* Barra de progreso */}
      <div className="mt-4 mb-2 relative h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
           onClick={(e) => {
             const container = e.currentTarget;
             const rect = container.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const percentage = (x / rect.width) * 100;
             seek(percentage);
           }}
      >
        <motion.div 
          className={`absolute top-0 left-0 h-full ${
            category === 'focus' ? 'bg-blue-500' : 
            category === 'relax' ? 'bg-green-500' : 
            'bg-purple-500'
          }`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Tiempo de reproducción */}
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(trackDuration)}</span>
      </div>
      
      {/* Controles del reproductor */}
      <div className="flex items-center justify-between">
        <button 
          className="p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setVolume(volume <= 0 ? 80 : 0)}
        >
          <Icon 
            icon={
              volume === 0 ? 'heroicons:speaker-x-mark' :
              volume < 30 ? 'heroicons:speaker-wave' :
              'heroicons:speaker-wave'
            } 
            width={20} 
          />
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-white transition-colors opacity-50">
            <Icon icon="heroicons:backward" width={24} />
          </button>
          
          <motion.button 
            className={`p-3 rounded-full ${
              isPlaying 
                ? 'bg-gray-700 text-white' 
                : 'bg-purple-600 text-white'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSession}
          >
            <Icon 
              icon={isPlaying ? 'heroicons:pause' : 'heroicons:play'} 
              width={24} 
            />
          </motion.button>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors opacity-50">
            <Icon icon="heroicons:forward" width={24} />
          </button>
        </div>
        
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #374151 ${volume}%, #374151 100%)`
            }}
          />
        </div>
      </div>
      
      {/* Estados de error o completado */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300"
          >
            <div className="flex items-center">
              <Icon icon="heroicons:exclamation-circle" className="mr-2" width={16} />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        
        {sessionCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-sm text-green-300"
          >
            <div className="flex items-center">
              <Icon icon="heroicons:check-circle" className="mr-2" width={16} />
              <span>¡Sesión completada! ¿Quieres comenzar otra?</span>
            </div>
            <div className="mt-2 flex justify-end">
              <button 
                onClick={toggleSession}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
              >
                Reiniciar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lista de pistas disponibles */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Pistas disponibles</h4>
          {availableTracks.length > 2 && (
            <button className="text-xs text-purple-400 hover:text-purple-300">
              Ver todas
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {availableTracks.map((audioTrack) => (
            <motion.div
              key={audioTrack.id}
              whileHover={{ x: 3 }}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                track?.id === audioTrack.id
                  ? 'bg-purple-900/30 border border-purple-700'
                  : 'hover:bg-gray-700/50'
              }`}
              onClick={() => loadTrack(audioTrack)}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  track?.id === audioTrack.id
                    ? 'bg-purple-600'
                    : 'bg-gray-700'
                }`}>
                  <Icon 
                    icon={
                      loading && track?.id === audioTrack.id
                        ? 'heroicons:arrow-path' 
                        : isPlaying && track?.id === audioTrack.id
                          ? 'heroicons:pause'
                          : 'heroicons:musical-note'
                    }
                    className={loading && track?.id === audioTrack.id ? 'animate-spin' : ''}
                    width={16}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white">{audioTrack.title}</p>
                  <p className="text-xs text-gray-400">{formatTime(audioTrack.duration)}</p>
                </div>
              </div>
              
              {audioTrack.requiresPremium && (
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-yellow-500/10">
                  <Icon icon="heroicons:star" className="text-yellow-400" width={12} />
                  <span className="text-xs text-yellow-400">Premium</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 
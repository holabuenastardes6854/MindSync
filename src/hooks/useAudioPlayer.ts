'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAudioService, type AudioTrack } from '@/lib/audio/audioService';

interface AudioPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  track: AudioTrack | null;
  loading: boolean;
  error: string | null;
  frequencyData: Uint8Array | null;
}

export function useAudioPlayer() {
  // Estado local para el reproductor
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 80, // 0-100
    track: null,
    loading: false,
    error: null,
    frequencyData: null
  });
  
  // Referencia al servicio de audio
  const audioServiceRef = useRef<ReturnType<typeof getAudioService> | null>(null);
  
  // Referencia para el intervalo de actualización de datos de frecuencia
  const frequencyUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar el servicio de audio
  useEffect(() => {
    // Configurar callbacks para el servicio de audio
    audioServiceRef.current = getAudioService({
      onPlay: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      },
      onPause: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      },
      onTimeUpdate: (currentTime) => {
        setPlayerState(prev => ({ ...prev, currentTime }));
      },
      onEnded: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      },
      onError: (error) => {
        setPlayerState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          error: error.message,
          loading: false
        }));
      },
      onLoad: (duration) => {
        setPlayerState(prev => ({ ...prev, duration, loading: false }));
      },
      onVolumeChange: (volume) => {
        // Convertir volumen de 0-1 a 0-100
        setPlayerState(prev => ({ ...prev, volume: volume * 100 }));
      }
    });

    // Configurar intervalo para actualizar datos de frecuencia para visualización
    frequencyUpdateRef.current = setInterval(() => {
      if (audioServiceRef.current && playerState.isPlaying) {
        const freqData = audioServiceRef.current.getFrequencyData();
        if (freqData) {
          setPlayerState(prev => ({ ...prev, frequencyData: freqData }));
        }
      }
    }, 100); // 10 fps es suficiente para visualización

    // Cleanup
    return () => {
      if (frequencyUpdateRef.current) {
        clearInterval(frequencyUpdateRef.current);
      }
      
      if (audioServiceRef.current) {
        audioServiceRef.current.cleanup();
      }
    };
  }, [playerState.isPlaying]);

  // Cargar una pista
  const loadTrack = useCallback(async (track: AudioTrack) => {
    if (!audioServiceRef.current) return;
    
    setPlayerState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      isPlaying: false,
      currentTime: 0,
      track
    }));
    
    try {
      await audioServiceRef.current.loadTrack(track);
    } catch (error) {
      setPlayerState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error al cargar pista',
        loading: false
      }));
    }
  }, []);

  // Reproducir o pausar
  const togglePlay = useCallback(() => {
    if (!audioServiceRef.current) return;
    
    if (playerState.isPlaying) {
      audioServiceRef.current.pause();
    } else {
      audioServiceRef.current.play();
    }
  }, [playerState.isPlaying]);

  // Solo reproducir
  const play = useCallback(() => {
    if (!audioServiceRef.current || playerState.isPlaying) return;
    audioServiceRef.current.play();
  }, [playerState.isPlaying]);

  // Solo pausar
  const pause = useCallback(() => {
    if (!audioServiceRef.current || !playerState.isPlaying) return;
    audioServiceRef.current.pause();
  }, [playerState.isPlaying]);

  // Buscar a una posición
  const seek = useCallback((percentage: number) => {
    if (!audioServiceRef.current) return;
    audioServiceRef.current.seekTo(percentage);
  }, []);

  // Ajustar volumen
  const setVolume = useCallback((volume: number) => {
    if (!audioServiceRef.current) return;
    // Convertir volumen de 0-100 a 0-1 para el servicio
    audioServiceRef.current.setVolume(volume / 100);
  }, []);

  // Formatear tiempo en minutos:segundos
  const formatTime = useCallback((timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calcular porcentaje de progreso
  const progress = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;

  return {
    ...playerState,
    loadTrack,
    togglePlay,
    play,
    pause,
    seek,
    setVolume,
    formatTime,
    progress
  };
} 
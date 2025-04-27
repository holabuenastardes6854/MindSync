'use client';

// Interfaz para un fragmento de pista de audio
interface AudioTrack {
  id: string;
  url: string;
  title: string;
  category: 'focus' | 'relax' | 'sleep';
  duration: number;
  requiresPremium?: boolean;
}

// Interfaz para la configuración del AudioService
interface AudioServiceConfig {
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onLoad?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
}

/**
 * Servicio para gestionar la reproducción de audio
 */
class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private trackBuffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private offset: number = 0;
  private currentVolume: number = 0.8; // 0-1
  private currentTrack: AudioTrack | null = null;
  private callbacks: AudioServiceConfig;
  private frequencyData: Uint8Array | null = null;
  private loopTimeout: NodeJS.Timeout | null = null;

  constructor(config: AudioServiceConfig = {}) {
    this.callbacks = config;
    this.initAudioContext();
  }

  private initAudioContext() {
    // Crear el AudioElement para una mejor compatibilidad cross-browser
    this.audioElement = new Audio();
    this.audioElement.volume = this.currentVolume;
    
    // Inicializar WebAudio API solo si está soportada
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.analyserNode = this.audioContext.createAnalyser();
        
        // Configurar el analizador para visualización
        this.analyserNode.fftSize = 256;
        this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
        
        // Conectar nodos de audio
        this.analyserNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = this.currentVolume;
        
        console.log('Audio context inicializado correctamente');
      } catch (error) {
        console.error('Error al inicializar AudioContext:', error);
      }
    }

    // Añadir event listeners al elemento de audio
    if (this.audioElement) {
      this.audioElement.addEventListener('play', () => this.callbacks.onPlay?.());
      this.audioElement.addEventListener('pause', () => this.callbacks.onPause?.());
      this.audioElement.addEventListener('timeupdate', () => {
        this.callbacks.onTimeUpdate?.(this.audioElement?.currentTime || 0);
      });
      this.audioElement.addEventListener('ended', () => this.callbacks.onEnded?.());
      this.audioElement.addEventListener('error', (e) => {
        this.callbacks.onError?.(new Error(`Error de reproducción: ${e.type}`));
      });
      this.audioElement.addEventListener('loadedmetadata', () => {
        this.callbacks.onLoad?.(this.audioElement?.duration || 0);
      });
      this.audioElement.addEventListener('volumechange', () => {
        this.callbacks.onVolumeChange?.(this.audioElement?.volume || 0);
      });
    }
  }

  /**
   * Carga una pista de audio y la prepara para reproducción
   */
  async loadTrack(track: AudioTrack): Promise<void> {
    try {
      this.currentTrack = track;

      if (this.audioElement) {
        // Para la pista actual si hay alguna reproduciéndose
        this.stop();
        
        // Cargar nueva URL
        this.audioElement.src = track.url;
        this.audioElement.load();
        
        console.log(`Pista cargada: ${track.title}`);
        
        return Promise.resolve();
      } else {
        throw new Error('El reproductor de audio no está inicializado');
      }
    } catch (error) {
      console.error('Error al cargar pista:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Error desconocido al cargar pista'));
      return Promise.reject(error);
    }
  }

  /**
   * Inicia o reanuda la reproducción
   */
  play(): void {
    if (!this.audioElement || !this.currentTrack) {
      console.error('No hay pista cargada para reproducir');
      return;
    }

    try {
      // Despertar AudioContext si está suspendido (política de autoplay)
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
          this.startAnimationLoop();
        })
        .catch(error => {
          console.error('Error al reproducir audio:', error);
          this.callbacks.onError?.(new Error('Error al reproducir: política de autoplay'));
        });
    } catch (error) {
      console.error('Error en play():', error);
    }
  }

  /**
   * Pausa la reproducción
   */
  pause(): void {
    if (!this.audioElement || !this.isPlaying) return;
    
    try {
      this.audioElement.pause();
      this.isPlaying = false;
      this.stopAnimationLoop();
    } catch (error) {
      console.error('Error en pause():', error);
    }
  }

  /**
   * Detiene la reproducción y reinicia al inicio
   */
  stop(): void {
    if (!this.audioElement) return;
    
    try {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      this.stopAnimationLoop();
    } catch (error) {
      console.error('Error en stop():', error);
    }
  }

  /**
   * Ajusta el volumen
   */
  setVolume(value: number): void {
    if (value < 0 || value > 1) {
      console.error('El volumen debe estar entre 0 y 1');
      return;
    }
    
    this.currentVolume = value;
    
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
    
    if (this.audioElement) {
      this.audioElement.volume = value;
    }
  }

  /**
   * Salta a una posición específica en la pista
   */
  seekTo(percentage: number): void {
    if (!this.audioElement || !this.currentTrack) return;
    
    try {
      const duration = this.audioElement.duration;
      if (isNaN(duration)) return;
      
      const newTime = duration * (percentage / 100);
      this.audioElement.currentTime = newTime;
    } catch (error) {
      console.error('Error en seekTo():', error);
    }
  }

  /**
   * Verifica si la pista está reproduciéndose actualmente
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Obtiene la duración total de la pista actual
   */
  getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  /**
   * Obtiene el tiempo actual de reproducción
   */
  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  /**
   * Obtiene el volumen actual
   */
  getVolume(): number {
    return this.currentVolume;
  }

  /**
   * Obtiene la pista actual
   */
  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  /**
   * Obtiene datos de frecuencia para visualización
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode || !this.frequencyData) return null;
    
    this.analyserNode.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  /**
   * Inicia el loop de animación para análisis de audio
   */
  private startAnimationLoop(): void {
    this.stopAnimationLoop();
    
    const updateFrequencyData = () => {
      if (!this.isPlaying) return;
      
      if (this.getFrequencyData()) {
        // No hacemos nada con los datos aquí, solo los actualizamos
        // Los componentes pueden obtenerlos via getFrequencyData()
      }
      
      this.loopTimeout = setTimeout(updateFrequencyData, 50); // 20 fps
    };
    
    updateFrequencyData();
  }

  /**
   * Detiene el loop de animación
   */
  private stopAnimationLoop(): void {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
  }

  /**
   * Limpia recursos al desmontar
   */
  cleanup(): void {
    this.stopAnimationLoop();
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.remove();
      this.audioElement = null;
    }
    
    if (this.currentSource) {
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    
    if (this.analyserNode) {
      this.analyserNode.disconnect();
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
    }
  }
}

// Singleton para reutilizar la instancia
let audioServiceInstance: AudioService | null = null;

/**
 * Obtiene o crea una instancia del servicio de audio
 */
export function getAudioService(config: AudioServiceConfig = {}): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService(config);
  }
  
  return audioServiceInstance;
}

export type { AudioTrack, AudioServiceConfig }; 
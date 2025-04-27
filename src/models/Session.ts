import mongoose from 'mongoose';

// Verificar si el modelo ya existe para evitar recompilación en desarrollo
const SessionModel = mongoose.models.Session || mongoose.model('Session', new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  category: { 
    type: String, 
    enum: ['focus', 'relax', 'sleep'], 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  }, // en minutos
  completedDuration: { 
    type: Number, 
    default: 0 
  }, // tiempo efectivamente reproducido
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  endedAt: { 
    type: Date 
  },
  tracks: [{ 
    trackId: String, 
    playedDuration: Number 
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}));

export default SessionModel;

// Tipo para TypeScript
export interface SessionDocument extends mongoose.Document {
  userId: string;
  category: 'focus' | 'relax' | 'sleep';
  duration: number;
  completedDuration: number;
  startedAt: Date;
  endedAt?: Date;
  tracks: {
    trackId: string;
    playedDuration: number;
  }[];
  isCompleted: boolean;
} 
import mongoose from 'mongoose';

// Verificar si el modelo ya existe para evitar recompilación en desarrollo
const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String 
  },
  stripeCustomerId: { 
    type: String 
  },
  preferences: {
    favoriteCategory: { 
      type: String, 
      enum: ['focus', 'relax', 'sleep'] 
    },
    preferredDuration: { 
      type: Number
    }, // in minutes
    volume: { 
      type: Number, 
      default: 80 
    },
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}));

export default UserModel;

// Tipo para TypeScript
export interface UserDocument extends mongoose.Document {
  clerkId: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  preferences?: {
    favoriteCategory?: 'focus' | 'relax' | 'sleep';
    preferredDuration?: number;
    volume?: number;
  };
  createdAt: Date;
  updatedAt: Date;
} 
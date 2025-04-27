import mongoose from 'mongoose';

// Verificar si el modelo ya existe para evitar recompilación en desarrollo
const SubscriptionModel = mongoose.models.Subscription || mongoose.model('Subscription', new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  stripeCustomerId: { 
    type: String 
  },
  stripePriceId: { 
    type: String 
  },
  stripeSubscriptionId: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'], 
    default: 'active' 
  },
  plan: { 
    type: String, 
    enum: ['free', 'premium', 'pro'], 
    default: 'free' 
  },
  currentPeriodStart: { 
    type: Date 
  },
  currentPeriodEnd: { 
    type: Date 
  },
  cancelAtPeriodEnd: { 
    type: Boolean, 
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}));

export default SubscriptionModel;

// Tipo para TypeScript
export interface SubscriptionDocument extends mongoose.Document {
  userId: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  plan: 'free' | 'premium' | 'pro';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
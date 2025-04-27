import { getDatabase } from '@/lib/mongodb/connection';
import { ObjectId } from 'mongodb';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type SubscriptionPlan = 'free' | 'premium' | 'pro';

export interface SubscriptionData {
  _id?: ObjectId;
  userId: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'subscriptions';

/**
 * Obtiene la suscripción de un usuario por su ID de usuario
 */
export async function getSubscriptionByUserId(userId: string): Promise<SubscriptionData | null> {
  const db = await getDatabase();
  const collection = db.collection<SubscriptionData>(COLLECTION);
  
  return collection.findOne({ userId });
}

/**
 * Crea o actualiza una suscripción
 */
export async function upsertSubscription(
  userId: string,
  subscriptionData: Partial<Omit<SubscriptionData, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<SubscriptionData> {
  const db = await getDatabase();
  const collection = db.collection<SubscriptionData>(COLLECTION);
  
  const now = new Date();
  
  // Buscar suscripción existente
  const existingSubscription = await collection.findOne({ userId });
  
  if (existingSubscription) {
    // Actualizar suscripción existente
    const updatedSubscription = await collection.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          ...subscriptionData,
          updatedAt: now 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return updatedSubscription!;
  } else {
    // Crear nueva suscripción
    const newSubscription: Omit<SubscriptionData, '_id'> = {
      userId,
      status: 'active',
      plan: 'free',
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
      ...subscriptionData
    };
    
    const result = await collection.insertOne(newSubscription);
    return { ...newSubscription, _id: result.insertedId };
  }
}

/**
 * Crea una suscripción gratuita por defecto para un nuevo usuario
 */
export async function createDefaultSubscription(userId: string): Promise<SubscriptionData> {
  return upsertSubscription(userId, {
    status: 'active',
    plan: 'free',
    cancelAtPeriodEnd: false
  });
}

/**
 * Actualiza el estado de una suscripción
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
  plan: SubscriptionPlan
): Promise<SubscriptionData | null> {
  const db = await getDatabase();
  const collection = db.collection<SubscriptionData>(COLLECTION);
  
  const result = await collection.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        status,
        plan,
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Cancela una suscripción
 */
export async function cancelSubscription(userId: string): Promise<SubscriptionData | null> {
  return updateSubscriptionStatus(userId, 'canceled', 'free');
} 
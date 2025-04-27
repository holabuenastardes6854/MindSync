import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';

// Collection name
const COLLECTION = 'subscriptions';

// Types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type SubscriptionPlan = 'free' | 'premium' | 'pro';

// Interface for Subscription document
export interface Subscription {
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

/**
 * Gets a subscription by user ID
 */
export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
  const db = await getDatabase();
  return db.collection<Subscription>(COLLECTION).findOne({ userId });
}

/**
 * Creates a new subscription
 */
export async function createSubscription(
  subscription: Omit<Subscription, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
  const db = await getDatabase();
  
  const now = new Date();
  const newSubscription = {
    ...subscription,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection<Subscription>(COLLECTION).insertOne(newSubscription);
  
  return {
    ...newSubscription,
    _id: result.insertedId
  };
}

/**
 * Creates a default free subscription for a new user
 */
export async function createDefaultSubscription(userId: string): Promise<Subscription> {
  return createSubscription({
    userId,
    status: 'active',
    plan: 'free',
    cancelAtPeriodEnd: false
  });
}

/**
 * Updates a subscription
 */
export async function updateSubscription(
  userId: string,
  update: Partial<Omit<Subscription, '_id' | 'userId' | 'createdAt'>>
): Promise<Subscription | null> {
  const db = await getDatabase();
  
  const result = await db.collection<Subscription>(COLLECTION).findOneAndUpdate(
    { userId },
    { 
      $set: { 
        ...update,
        updatedAt: new Date() 
      } 
    },
    { 
      returnDocument: 'after',
      upsert: false
    }
  );
  
  return result;
}

/**
 * Upserts a subscription (updates if exists, creates if not)
 */
export async function upsertSubscription(
  userId: string,
  data: Partial<Omit<Subscription, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Subscription | null> {
  const db = await getDatabase();
  
  const now = new Date();
  
  const result = await db.collection<Subscription>(COLLECTION).findOneAndUpdate(
    { userId },
    {
      $set: {
        ...data,
        updatedAt: now
      },
      $setOnInsert: {
        userId,
        createdAt: now,
        status: data.status || 'active',
        plan: data.plan || 'free',
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false
      }
    },
    {
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(userId: string): Promise<Subscription | null> {
  return updateSubscription(userId, {
    status: 'canceled',
    plan: 'free',
    cancelAtPeriodEnd: true
  });
} 
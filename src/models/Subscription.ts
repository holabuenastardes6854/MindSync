import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';

// Collection name
const COLLECTION = 'subscriptions';

// Types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid';
export type SubscriptionPlan = 'free' | 'premium' | 'pro';
export type PaymentMethod = 'card' | 'crypto' | 'bank_transfer' | 'other';

// Interface for Subscription document
export interface Subscription {
  _id?: ObjectId;
  userId: string;
  userEmail?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  paymentMethod?: PaymentMethod;
  firstPurchaseDate?: Date;  // Fecha de la primera compra de un plan de pago
  latestPurchaseDate?: Date; // Fecha de la última compra/renovación
  paymentHistory?: {
    paymentId: string;
    amount: number;
    currency: string;
    date: Date;
    status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  }[];
  discountCode?: string;
  discountPercentage?: number;
  discountValidUntil?: Date;
  cancelReason?: string;
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
        userEmail: data.userEmail,
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
 * Adds a payment record to the subscription's payment history
 */
export async function addPaymentRecord(
  userId: string,
  payment: {
    paymentId: string;
    amount: number;
    currency: string;
    date: Date;
    status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  }
): Promise<Subscription | null> {
  const db = await getDatabase();
  const now = new Date();
  
  // Solo actualizar latestPurchaseDate si el pago fue exitoso
  const updateFields: Record<string, any> = {
    $push: { 
      paymentHistory: payment 
    },
    $set: {
      updatedAt: now
    }
  };
  
  // Si el pago fue exitoso, actualizar la fecha de última compra
  if (payment.status === 'succeeded') {
    updateFields.$set.latestPurchaseDate = payment.date;
  }
  
  // Primero, verificar si es la primera compra
  const subscription = await getSubscriptionByUserId(userId);
  if (!subscription?.firstPurchaseDate && payment.status === 'succeeded') {
    // Si no hay fecha de primera compra y el pago fue exitoso, establecer como la primera
    updateFields.$set.firstPurchaseDate = payment.date;
  }
  
  // Actualizar la suscripción
  const result = await db.collection<Subscription>(COLLECTION).findOneAndUpdate(
    { userId },
    updateFields,
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(
  userId: string, 
  reason?: string
): Promise<Subscription | null> {
  return updateSubscription(userId, {
    status: 'canceled',
    plan: 'free',
    cancelAtPeriodEnd: true,
    cancelReason: reason
  });
}

/**
 * Gets subscription stats for the platform
 */
export async function getSubscriptionStats(): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  planCounts: Record<SubscriptionPlan, number>;
  revenue: {
    lastMonth: number;
    lastYear: number;
  }
}> {
  const db = await getDatabase();
  const collection = db.collection<Subscription>(COLLECTION);
  
  // Count total subscriptions
  const totalSubscriptions = await collection.countDocuments();
  
  // Count active subscriptions
  const activeSubscriptions = await collection.countDocuments({
    status: 'active'
  });
  
  // Count subscriptions by plan
  const planAggregate = await collection.aggregate([
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  const planCounts = {
    free: 0,
    premium: 0,
    pro: 0
  };
  
  planAggregate.forEach(item => {
    planCounts[item._id as SubscriptionPlan] = item.count;
  });
  
  // Calculate revenue estimates (in a real app, you'd use the payment history)
  // This is just a placeholder implementation
  return {
    totalSubscriptions,
    activeSubscriptions,
    planCounts,
    revenue: {
      lastMonth: 0, // Calcular en base al historial real
      lastYear: 0   // Calcular en base al historial real
    }
  };
}

/**
 * Deletes a subscription by user ID
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
  const db = await getDatabase();
  
  const result = await db.collection(COLLECTION).deleteOne({ userId });
  
  return result.deletedCount === 1;
} 
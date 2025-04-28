import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';
import { SubscriptionPlan } from './Subscription';

// Collection name
const COLLECTION = 'users';

// Interface for User document
export interface User {
  _id?: ObjectId;
  clerkId: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  plan?: SubscriptionPlan;  // Referencia rápida al plan actual
  subscriptionId?: string;  // Referencia al ID de la suscripción
  planPurchaseDate?: Date;  // Fecha de compra del plan premium
  trialEndsAt?: Date;       // Fecha de finalización del período de prueba
  preferences?: {
    favoriteCategory?: 'focus' | 'relax' | 'sleep';
    preferredDuration?: number;
    volume?: number;
    favoriteTrackIds?: string[];  // IDs de pistas favoritas
    interfaceTheme?: 'dark' | 'light' | 'system';
    notificationsEnabled?: boolean;
    weeklyReportEnabled?: boolean;
  };
  stats?: {
    totalSessionsCompleted: number;
    totalMinutesListened: number;
    lastSessionDate?: Date;
    streakDays: number;
    categoriesUsage: {
      focus: number;
      relax: number;
      sleep: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gets a user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = await getDatabase();
  return db.collection<User>(COLLECTION).findOne({ clerkId });
}

/**
 * Gets a user by their Stripe customer ID
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const db = await getDatabase();
  return db.collection<User>(COLLECTION).findOne({ stripeCustomerId });
}

/**
 * Creates a new user
 */
export async function createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const db = await getDatabase();
  
  const now = new Date();
  const newUser = {
    ...user,
    plan: user.plan || 'free',
    stats: user.stats || {
      totalSessionsCompleted: 0,
      totalMinutesListened: 0,
      streakDays: 0,
      categoriesUsage: {
        focus: 0,
        relax: 0,
        sleep: 0
      }
    },
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection<User>(COLLECTION).insertOne(newUser);
  
  return {
    ...newUser,
    _id: result.insertedId
  };
}

/**
 * Updates a user
 */
export async function updateUser(
  clerkId: string, 
  update: Partial<Omit<User, '_id' | 'clerkId' | 'createdAt'>>
): Promise<User | null> {
  const db = await getDatabase();
  
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    { 
      $set: { 
        ...update, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Updates a user's plan information
 */
export async function updateUserPlan(
  clerkId: string,
  planInfo: {
    plan: SubscriptionPlan,
    subscriptionId?: string,
    planPurchaseDate?: Date,
    trialEndsAt?: Date
  }
): Promise<User | null> {
  return updateUser(clerkId, planInfo);
}

/**
 * Updates a user's subscription stats after a session
 */
export async function updateUserStats(
  clerkId: string, 
  sessionData: {
    category: 'focus' | 'relax' | 'sleep',
    duration: number
  }
): Promise<User | null> {
  const db = await getDatabase();
  const user = await getUserByClerkId(clerkId);
  
  if (!user) return null;
  
  // Prepare the update
  const now = new Date();
  const statsUpdate = {
    [`stats.totalSessionsCompleted`]: (user.stats?.totalSessionsCompleted || 0) + 1,
    [`stats.totalMinutesListened`]: (user.stats?.totalMinutesListened || 0) + sessionData.duration,
    [`stats.lastSessionDate`]: now,
    [`stats.categoriesUsage.${sessionData.category}`]: 
      (user.stats?.categoriesUsage?.[sessionData.category] || 0) + 1
  };
  
  // Calculate streak
  let newStreakDays = user.stats?.streakDays || 0;
  const lastSessionDate = user.stats?.lastSessionDate;
  
  if (lastSessionDate) {
    // Get dates without time component
    const today = new Date(now.setHours(0, 0, 0, 0));
    const lastDay = new Date(lastSessionDate.setHours(0, 0, 0, 0));
    const dayDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      // Consecutive day - increase streak
      newStreakDays++;
    } else if (dayDiff > 1) {
      // Streak broken - reset to 1
      newStreakDays = 1;
    }
    // If dayDiff is 0 (same day), keep current streak
  } else {
    // First session ever
    newStreakDays = 1;
  }
  
  statsUpdate[`stats.streakDays`] = newStreakDays;
  
  // Update the user document
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    { 
      $set: { 
        ...statsUpdate,
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Deletes a user
 */
export async function deleteUser(clerkId: string): Promise<boolean> {
  const db = await getDatabase();
  
  const result = await db.collection(COLLECTION).deleteOne({ clerkId });
  
  return result.deletedCount === 1;
} 


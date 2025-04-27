import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';

// Collection name
const COLLECTION = 'users';

// Interface for User document
export interface User {
  _id?: ObjectId;
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
 * Deletes a user
 */
export async function deleteUser(clerkId: string): Promise<boolean> {
  const db = await getDatabase();
  
  const result = await db.collection(COLLECTION).deleteOne({ clerkId });
  
  return result.deletedCount === 1;
} 


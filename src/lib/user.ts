import { getDatabase } from '@/lib/mongodb/connection';
import { ObjectId } from 'mongodb';

export interface UserData {
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

const COLLECTION = 'users';

/**
 * Crea un nuevo usuario en la base de datos
 */
export async function createUser(userData: Omit<UserData, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
  const db = await getDatabase();
  const collection = db.collection<UserData>(COLLECTION);
  
  const now = new Date();
  const userToInsert = {
    ...userData,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await collection.insertOne(userToInsert);
  return { ...userToInsert, _id: result.insertedId };
}

/**
 * Busca un usuario por su ID de Clerk
 */
export async function getUserByClerkId(clerkId: string): Promise<UserData | null> {
  const db = await getDatabase();
  const collection = db.collection<UserData>(COLLECTION);
  
  return collection.findOne({ clerkId });
}

/**
 * Busca un usuario por su ID de cliente de Stripe
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<UserData | null> {
  const db = await getDatabase();
  const collection = db.collection<UserData>(COLLECTION);
  
  return collection.findOne({ stripeCustomerId });
}

/**
 * Actualiza la información de un usuario
 */
export async function updateUser(
  clerkId: string, 
  updateData: Partial<Omit<UserData, '_id' | 'clerkId' | 'createdAt' | 'updatedAt'>>
): Promise<UserData | null> {
  const db = await getDatabase();
  const collection = db.collection<UserData>(COLLECTION);
  
  const result = await collection.findOneAndUpdate(
    { clerkId },
    { 
      $set: { 
        ...updateData,
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Elimina un usuario de la base de datos
 */
export async function deleteUser(clerkId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION);
  
  const result = await collection.deleteOne({ clerkId });
  return result.deletedCount === 1;
} 
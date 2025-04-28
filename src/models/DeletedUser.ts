import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';

// Collection name
const COLLECTION = 'deleted_users';

// Interface for DeletedUser document
export interface DeletedUser {
  _id?: ObjectId;
  clerkId: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  plan?: string;
  deletedAt: Date;
  createdAt?: Date;
  lastLoginAt?: Date;
  usageStats?: {
    totalSessionsCompleted?: number;
    totalMinutesListened?: number;
    categoriesUsage?: Record<string, number>;
  };
  subscriptionInfo?: {
    plan?: string;
    status?: string;
    cancelReason?: string;
  };
  deletionReason?: string;
  deletionSource: 'user' | 'admin' | 'system';
  feedbackData?: {
    reason?: string;
    comments?: string;
    rating?: number;
  };
}

/**
 * Archives a user's data in the deleted_users collection
 */
export async function archiveDeletedUser(userData: Omit<DeletedUser, '_id'>): Promise<DeletedUser> {
  const db = await getDatabase();
  
  const result = await db.collection<DeletedUser>(COLLECTION).insertOne(userData);
  
  return {
    ...userData,
    _id: result.insertedId
  };
}

/**
 * Gets archived user data by their Clerk ID
 */
export async function getDeletedUserByClerkId(clerkId: string): Promise<DeletedUser | null> {
  const db = await getDatabase();
  return db.collection<DeletedUser>(COLLECTION).findOne({ clerkId });
}

/**
 * Gets all deleted users with optional filtering and pagination
 */
export async function getDeletedUsers(
  options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fromDate?: Date;
    toDate?: Date;
    deletionSource?: 'user' | 'admin' | 'system';
  } = {}
): Promise<DeletedUser[]> {
  const {
    limit = 100,
    skip = 0,
    sortBy = 'deletedAt',
    sortOrder = 'desc',
    fromDate,
    toDate,
    deletionSource
  } = options;

  const db = await getDatabase();
  
  // Build filter
  const filter: Record<string, any> = {};
  
  if (fromDate || toDate) {
    filter.deletedAt = {};
    if (fromDate) filter.deletedAt.$gte = fromDate;
    if (toDate) filter.deletedAt.$lte = toDate;
  }
  
  if (deletionSource) {
    filter.deletionSource = deletionSource;
  }
  
  // Execute query
  return db.collection<DeletedUser>(COLLECTION)
    .find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Gets statistics about deleted users
 */
export async function getDeletedUserStats(): Promise<{
  totalDeleted: number;
  byReason: Record<string, number>;
  bySource: Record<string, number>;
  byMonth: Record<string, number>;
}> {
  const db = await getDatabase();
  const collection = db.collection<DeletedUser>(COLLECTION);
  
  // Total deleted users
  const totalDeleted = await collection.countDocuments();
  
  // Group by deletion reason
  const reasonAgg = await collection.aggregate([
    {
      $group: {
        _id: '$deletionReason',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  const byReason: Record<string, number> = {};
  reasonAgg.forEach(item => {
    byReason[item._id || 'unknown'] = item.count;
  });
  
  // Group by deletion source
  const sourceAgg = await collection.aggregate([
    {
      $group: {
        _id: '$deletionSource',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  const bySource: Record<string, number> = {
    user: 0,
    admin: 0,
    system: 0
  };
  sourceAgg.forEach(item => {
    bySource[item._id as string] = item.count;
  });
  
  // Group by month
  const monthAgg = await collection.aggregate([
    {
      $project: {
        yearMonth: { 
          $dateToString: { format: '%Y-%m', date: '$deletedAt' }
        }
      }
    },
    {
      $group: {
        _id: '$yearMonth',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).toArray();
  
  const byMonth: Record<string, number> = {};
  monthAgg.forEach(item => {
    byMonth[item._id] = item.count;
  });
  
  return {
    totalDeleted,
    byReason,
    bySource,
    byMonth
  };
} 
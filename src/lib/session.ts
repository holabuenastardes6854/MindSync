import { getDatabase } from '@/lib/mongodb/connection';
import { ObjectId } from 'mongodb';

export type SessionCategory = 'focus' | 'relax' | 'sleep';

export interface SessionData {
  _id?: ObjectId;
  userId: string;
  category: SessionCategory;
  duration: number; // in minutes
  completedAt: Date;
  createdAt: Date;
}

const COLLECTION = 'sessions';

/**
 * Records a completed meditation session
 */
export async function recordSession(
  userId: string,
  category: SessionCategory,
  duration: number
): Promise<SessionData> {
  const db = await getDatabase();
  const collection = db.collection<SessionData>(COLLECTION);
  
  const now = new Date();
  
  const session: Omit<SessionData, '_id'> = {
    userId,
    category,
    duration,
    completedAt: now,
    createdAt: now
  };
  
  const result = await collection.insertOne(session);
  return { ...session, _id: result.insertedId };
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  const db = await getDatabase();
  const collection = db.collection<SessionData>(COLLECTION);
  
  return collection.find({ userId }).sort({ completedAt: -1 }).toArray();
}

/**
 * Get user session stats 
 */
export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  categoryCounts: Record<SessionCategory, number>;
  categoryMinutes: Record<SessionCategory, number>;
  streakDays: number;
  lastSessionDate: Date | null;
}

export async function getUserSessionStats(userId: string): Promise<SessionStats> {
  const db = await getDatabase();
  const collection = db.collection<SessionData>(COLLECTION);
  
  const sessions = await collection.find({ userId }).sort({ completedAt: -1 }).toArray();
  
  // Default stats
  const stats: SessionStats = {
    totalSessions: 0,
    totalMinutes: 0,
    categoryCounts: {
      focus: 0,
      relax: 0,
      sleep: 0
    },
    categoryMinutes: {
      focus: 0,
      relax: 0,
      sleep: 0
    },
    streakDays: 0,
    lastSessionDate: null
  };
  
  if (sessions.length === 0) {
    return stats;
  }
  
  // Process session data
  stats.totalSessions = sessions.length;
  stats.lastSessionDate = sessions[0].completedAt;
  
  // Set of dates (YYYY-MM-DD format) when user meditated
  const sessionDates = new Set<string>();
  
  for (const session of sessions) {
    // Increment total minutes
    stats.totalMinutes += session.duration;
    
    // Increment category counts and minutes
    stats.categoryCounts[session.category]++;
    stats.categoryMinutes[session.category] += session.duration;
    
    // Track unique dates for streak calculation
    const dateStr = session.completedAt.toISOString().split('T')[0];
    sessionDates.add(dateStr);
  }
  
  // Calculate streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if user meditated today
  const todayStr = today.toISOString().split('T')[0];
  const hadSessionToday = sessionDates.has(todayStr);
  
  // Start with today or yesterday based on if user already meditated today
  const currentDate = new Date(today);
  if (!hadSessionToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    currentStreak = 1;
  }
  
  // Count consecutive days with meditation sessions
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (sessionDates.has(dateStr)) {
      if (!hadSessionToday || currentStreak > 0) {
        currentStreak++;
      }
    } else {
      break;
    }
    
    // Move to the previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  stats.streakDays = currentStreak;
  
  return stats;
} 
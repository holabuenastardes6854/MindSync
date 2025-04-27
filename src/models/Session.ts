import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb/connection';

// Collection name
const COLLECTION = 'sessions';

// Interface for Session document
export interface Session {
  _id?: ObjectId;
  userId: string;
  category: 'focus' | 'relax' | 'sleep';
  duration: number; // in minutes
  completedDuration: number; // time effectively played
  startedAt: Date;
  endedAt?: Date;
  tracks: {
    trackId: string;
    playedDuration: number;
  }[];
  isCompleted: boolean;
}

/**
 * Creates a new session
 */
export async function createSession(session: Omit<Session, '_id'>): Promise<Session> {
  const db = await getDatabase();
  
  // Set default values if not provided
  const sessionWithDefaults = {
    ...session,
    completedDuration: session.completedDuration || 0,
    startedAt: session.startedAt || new Date(),
    isCompleted: session.isCompleted || false,
    tracks: session.tracks || []
  };
  
  const result = await db.collection<Session>(COLLECTION).insertOne(sessionWithDefaults);
  
  return {
    ...sessionWithDefaults,
    _id: result.insertedId
  };
}

/**
 * Gets sessions by user ID
 */
export async function getSessionsByUserId(userId: string): Promise<Session[]> {
  const db = await getDatabase();
  
  return db.collection<Session>(COLLECTION)
    .find({ userId })
    .sort({ startedAt: -1 })
    .toArray();
}

/**
 * Updates a session
 */
export async function updateSession(
  sessionId: string | ObjectId,
  update: Partial<Omit<Session, '_id' | 'userId'>>
): Promise<Session | null> {
  const db = await getDatabase();
  
  // Convert string ID to ObjectId if needed
  const _id = typeof sessionId === 'string' ? new ObjectId(sessionId) : sessionId;
  
  const result = await db.collection<Session>(COLLECTION).findOneAndUpdate(
    { _id },
    { $set: update },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Completes a session
 */
export async function completeSession(
  sessionId: string | ObjectId,
  completedDuration: number
): Promise<Session | null> {
  return updateSession(sessionId, {
    isCompleted: true,
    completedDuration,
    endedAt: new Date()
  });
}

/**
 * Gets session stats for a user
 */
export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  categoryCounts: Record<'focus' | 'relax' | 'sleep', number>;
  categoryMinutes: Record<'focus' | 'relax' | 'sleep', number>;
  streakDays: number;
  lastSessionDate: Date | null;
}

export async function getUserSessionStats(userId: string): Promise<SessionStats> {
  const db = await getDatabase();
  
  // Get all user sessions
  const sessions = await db.collection<Session>(COLLECTION)
    .find({ userId, isCompleted: true })
    .sort({ startedAt: -1 })
    .toArray();
  
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
  stats.lastSessionDate = sessions[0].startedAt;
  
  // Set of dates (YYYY-MM-DD format) when user meditated
  const sessionDates = new Set<string>();
  
  for (const session of sessions) {
    // Increment total minutes
    stats.totalMinutes += session.completedDuration;
    
    // Increment category counts and minutes
    stats.categoryCounts[session.category]++;
    stats.categoryMinutes[session.category] += session.completedDuration;
    
    // Track unique dates for streak calculation
    const dateStr = session.startedAt.toISOString().split('T')[0];
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
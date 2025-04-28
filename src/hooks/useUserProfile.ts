'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export type UserPreferences = {
  favoriteCategory?: 'focus' | 'relax' | 'sleep';
  preferredDuration?: number;
  volume?: number;
  favoriteTrackIds?: string[];
  interfaceTheme?: 'dark' | 'light' | 'system';
  notificationsEnabled?: boolean;
  weeklyReportEnabled?: boolean;
};

export type UserStats = {
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

export type UserSubscription = {
  id?: string;
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  paymentMethod?: 'card' | 'crypto' | 'bank_transfer' | 'other';
  firstPurchaseDate?: Date;
  latestPurchaseDate?: Date;
};

export type UserProfile = {
  id?: string;
  clerkId: string;
  email: string;
  name?: string;
  plan?: 'free' | 'premium' | 'pro';
  preferences?: UserPreferences;
  stats?: UserStats;
  createdAt: Date;
  subscription: UserSubscription;
};

export function useUserProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el perfil del usuario
  useEffect(() => {
    async function fetchUserProfile() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error(`Error al cargar el perfil: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Formatear fechas
        if (data.user.createdAt) {
          data.user.createdAt = new Date(data.user.createdAt);
        }
        
        if (data.user.stats?.lastSessionDate) {
          data.user.stats.lastSessionDate = new Date(data.user.stats.lastSessionDate);
        }
        
        if (data.subscription?.currentPeriodEnd) {
          data.subscription.currentPeriodEnd = new Date(data.subscription.currentPeriodEnd);
        }
        
        if (data.subscription?.trialEnd) {
          data.subscription.trialEnd = new Date(data.subscription.trialEnd);
        }
        
        if (data.subscription?.firstPurchaseDate) {
          data.subscription.firstPurchaseDate = new Date(data.subscription.firstPurchaseDate);
        }
        
        if (data.subscription?.latestPurchaseDate) {
          data.subscription.latestPurchaseDate = new Date(data.subscription.latestPurchaseDate);
        }
        
        // Combinar datos
        const userProfile: UserProfile = {
          ...data.user,
          subscription: data.subscription
        };
        
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el perfil del usuario:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [isLoaded, isSignedIn, userId]);

  // Función para actualizar las preferencias del usuario
  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<boolean> => {
    if (!isSignedIn || !profile) return false;
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: newPreferences }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar preferencias: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      setProfile(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...newPreferences
          }
        };
      });
      
      return true;
    } catch (err) {
      console.error('Error al actualizar preferencias:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  // Verificar si el usuario tiene acceso a funciones premium
  const hasPremiumAccess = (): boolean => {
    if (!profile) return false;
    
    const isPremiumPlan = ['premium', 'pro'].includes(profile.subscription.plan);
    const isActiveSubscription = profile.subscription.status === 'active' || profile.subscription.status === 'trialing';
    
    return isPremiumPlan && isActiveSubscription;
  };

  // Obtener datos para estadísticas
  const getStatsData = () => {
    if (!profile || !profile.stats) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        streak: 0,
        categories: {
          focus: 0,
          relax: 0,
          sleep: 0
        }
      };
    }
    
    return {
      totalSessions: profile.stats.totalSessionsCompleted,
      totalMinutes: profile.stats.totalMinutesListened,
      streak: profile.stats.streakDays,
      categories: profile.stats.categoriesUsage
    };
  };

  return {
    profile,
    loading,
    error,
    updatePreferences,
    hasPremiumAccess,
    getStatsData,
    isSignedIn
  };
} 
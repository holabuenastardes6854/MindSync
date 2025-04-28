import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { getUserByClerkId } from '@/models/User';
import { getSubscriptionByUserId } from '@/models/Subscription';

export async function GET() {
  try {
    // Verificar autenticación
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }

    // Conectar a MongoDB
    await connectToDatabase();
    
    // Obtener información del usuario
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos.' },
        { status: 404 }
      );
    }
    
    // Obtener información de suscripción
    const subscription = await getSubscriptionByUserId(userId);
    
    // Preparar respuesta con información combinada
    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name || '',
        plan: user.plan || 'free',
        preferences: user.preferences || {
          favoriteCategory: undefined,
          preferredDuration: 30,
          volume: 80,
          interfaceTheme: 'dark',
          notificationsEnabled: true,
          weeklyReportEnabled: true
        },
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
        createdAt: user.createdAt,
      },
      subscription: subscription ? {
        id: subscription._id?.toString(),
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd,
        paymentMethod: subscription.paymentMethod,
        firstPurchaseDate: subscription.firstPurchaseDate,
        latestPurchaseDate: subscription.latestPurchaseDate
      } : {
        plan: 'free',
        status: 'active',
        cancelAtPeriodEnd: false
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener perfil de usuario' },
      { status: 500 }
    );
  }
} 
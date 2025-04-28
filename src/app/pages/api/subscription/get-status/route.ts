import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb/connection';
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
    
    // Buscar suscripción activa del usuario
    const subscription = await getSubscriptionByUserId(userId);
    
    // Si no existe suscripción, retornar plan gratuito por defecto
    if (!subscription) {
      return NextResponse.json({
        subscription: {
          id: 'free_default',
          plan: 'free',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Un año desde ahora
          cancelAtPeriodEnd: false
        }
      });
    }

    // Retornar información de la suscripción
    return NextResponse.json({
      subscription: {
        id: subscription._id?.toString() || 'unknown',
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || new Date().toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener estado de suscripción' },
      { status: 500 }
    );
  }
} 
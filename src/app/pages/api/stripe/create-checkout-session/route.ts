import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createCheckoutSession } from '@/lib/stripe/stripe';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { getUserByClerkId } from '@/models/User';

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { priceId, successUrl, cancelUrl } = body;

    // Validar campos requeridos
    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Se requieren priceId, successUrl y cancelUrl.' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB y obtener información del usuario
    await connectToDatabase();
    const user = await getUserByClerkId(userId);
    const authUser = await getAuthUser(userId);
    
    // Determinar si ya existe un customerId o se necesita el email
    const customerEmail = authUser?.email;
    const customerId = user?.stripeCustomerId || authUser?.stripeCustomerId;

    if (!customerEmail && !customerId) {
      return NextResponse.json(
        { error: 'No se pudo obtener información del usuario.' },
        { status: 400 }
      );
    }

    // Crear sesión de checkout
    const { url, sessionId } = await createCheckoutSession({
      priceId,
      userId,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata: {
        userId,
      }
    });

    return NextResponse.json({ url, sessionId });
  } catch (error) {
    console.error('Error al crear sesión de checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: `Error al crear sesión de checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
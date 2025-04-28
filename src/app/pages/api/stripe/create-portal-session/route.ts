import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createCustomerPortalSession } from '@/lib/stripe/stripe';
import { getAuthUser } from '@/lib/auth';

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
    const { returnUrl } = body;

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Se requiere una URL de retorno.' },
        { status: 400 }
      );
    }

    // Obtener el usuario y verificar si tiene un customerId de Stripe
    const user = await getAuthUser(userId);
    
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No se encontró un cliente de Stripe asociado a este usuario.' },
        { status: 400 }
      );
    }

    // Crear sesión del portal de clientes
    const { url } = await createCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error al crear sesión del portal de clientes:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión del portal de clientes' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createCheckoutSession } from '@/lib/stripe/stripe';

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

    console.log(`Usuario autenticado: ${userId}`);

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { priceId, successUrl, cancelUrl } = body;

    console.log('Datos recibidos:', { priceId, successUrl, cancelUrl });

    // Validar parámetros requeridos
    if (!priceId) {
      return NextResponse.json(
        { error: 'Se requiere un ID de precio válido.' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Se requieren URLs de éxito y cancelación.' },
        { status: 400 }
      );
    }

    // Verificar variables de entorno
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
      return NextResponse.json(
        { error: 'Error de configuración del servidor: Stripe no está configurado correctamente.' },
        { status: 500 }
      );
    }

    console.log('Iniciando creación de sesión de checkout con Stripe');

    // Crear sesión de checkout
    const { url, sessionId } = await createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      userId,
    });

    console.log(`Sesión de checkout creada exitosamente: ${sessionId}`);

    return NextResponse.json({ url, sessionId });
  } catch (error: unknown) {
    console.error('Error detallado al crear sesión de checkout:', error);
    
    // Proporcionar un mensaje de error más descriptivo
    let errorMessage = 'Error al crear sesión de checkout';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
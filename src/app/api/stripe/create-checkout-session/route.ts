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

    // Validar el formato del ID de precio
    if (!priceId.startsWith('price_')) {
      return NextResponse.json(
        { 
          error: 'Formato de ID de precio inválido. Debe comenzar con "price_".',
          details: 'Has proporcionado un ID de producto (prod_) en lugar de un ID de precio (price_).'
        },
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

    // Implementar modo de simulación para desarrollo cuando Stripe está suspendido
    // Solo para uso en desarrollo - quitar en producción
    const isDevelopment = process.env.NODE_ENV === 'development';
    const useSimulationMode = isDevelopment && (process.env.USE_STRIPE_SIMULATION === 'true');
    
    if (useSimulationMode) {
      console.log('Usando modo de simulación para Stripe (solo desarrollo)');
      
      // Simular una respuesta exitosa para propósitos de desarrollo
      return NextResponse.json({
        url: `${successUrl}?simulation=true&sessionId=sim_123456789`,
        sessionId: 'sim_123456789',
        simulation: true
      });
    }

    try {
      // Crear sesión de checkout
      const { url, sessionId } = await createCheckoutSession({
        priceId,
        successUrl,
        cancelUrl,
        userId,
      });

      console.log(`Sesión de checkout creada exitosamente: ${sessionId}`);

      return NextResponse.json({ url, sessionId });
    } catch (stripeError: unknown) {
      // Capturar específicamente errores relacionados con cuenta suspendida
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Error desconocido de Stripe';
      
      if (errorMessage.includes('account has been suspended') || 
          errorMessage.includes('account cannot create charges') ||
          errorMessage.includes('payments disabled')) {
        console.error('Error de Stripe - Cuenta suspendida:', errorMessage);
        return NextResponse.json(
          { 
            error: 'Los pagos están suspendidos en esta cuenta de Stripe. Por favor contacta con soporte.',
            details: errorMessage,
            accountSuspended: true
          },
          { status: 503 }
        );
      }
      
      // Otros errores de Stripe
      console.error('Error de Stripe:', errorMessage);
      throw stripeError;
    }
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
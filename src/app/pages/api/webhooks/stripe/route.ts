import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/stripe';
import { connectToDatabase } from '@/lib/mongodb/connection';
import SubscriptionModel from '@/models/Subscription';
import UserModel from '@/models/User';

// Maneja todas las solicitudes POST a /api/webhooks/stripe
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new NextResponse('Faltan encabezados de webhook', { status: 400 });
  }

  try {
    // Verificar la firma del webhook
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    // Conectar a MongoDB
    await connectToDatabase();

    console.log(`Procesando evento de Stripe: ${event.type}`);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerUpdate(event.data.object);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Stripe:', error);
    return new NextResponse(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`, { 
      status: 400 
    });
  }
}

/**
 * Maneja la creación o actualización de una suscripción
 */
async function handleSubscriptionChange(subscription: any) {
  // Extraer datos relevantes
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // Determinar el plan basado en el precio
  let plan = 'free';
  
  // Aquí deberías tener una lógica para determinar el plan basado en priceId
  // Esto es solo un ejemplo, deberías adaptarlo a tus propios IDs de precios
  if (priceId && priceId.includes('premium')) {
    plan = 'premium';
  } else if (priceId && priceId.includes('pro')) {
    plan = 'pro';
  }

  // Buscar usuario por customerId
  const user = await UserModel.findOne({ stripeCustomerId: customerId });
  
  if (!user) {
    console.error(`No se encontró usuario con customerId: ${customerId}`);
    return;
  }

  // Actualizar o crear suscripción
  await SubscriptionModel.findOneAndUpdate(
    { userId: user.clerkId },
    {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status,
      plan,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      updatedAt: new Date()
    },
    { upsert: true }
  );

  console.log(`Suscripción ${status} para usuario: ${user.clerkId}`);
}

/**
 * Maneja la cancelación de una suscripción
 */
async function handleSubscriptionCancelled(subscription: any) {
  const customerId = subscription.customer;
  
  // Buscar usuario por customerId
  const user = await UserModel.findOne({ stripeCustomerId: customerId });
  
  if (!user) {
    console.error(`No se encontró usuario con customerId: ${customerId}`);
    return;
  }

  // Actualizar suscripción a cancelada y plan a free
  await SubscriptionModel.findOneAndUpdate(
    { userId: user.clerkId },
    {
      status: 'canceled',
      plan: 'free',
      cancelAtPeriodEnd: true,
      updatedAt: new Date()
    }
  );

  console.log(`Suscripción cancelada para usuario: ${user.clerkId}`);
}

/**
 * Maneja el evento de checkout completado
 */
async function handleCheckoutCompleted(session: any) {
  // Solo procesar si es una suscripción
  if (session.mode !== 'subscription') return;

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('Checkout sin userId en metadata');
    return;
  }

  // Actualizar usuario con customerId si no lo tiene
  await UserModel.findOneAndUpdate(
    { clerkId: userId },
    { 
      stripeCustomerId: customerId,
      updatedAt: new Date()
    }
  );

  console.log(`Checkout completado para usuario: ${userId}`);
}

/**
 * Maneja la creación o actualización de un cliente
 */
async function handleCustomerUpdate(customer: any) {
  // Actualizar los metadatos para relacionar con el usuario de Clerk
  const customerId = customer.id;
  const clerkId = customer.metadata?.userId;

  if (!clerkId) {
    console.log('Cliente sin userId en metadata');
    return;
  }

  // Actualizar usuario con customerId
  await UserModel.findOneAndUpdate(
    { clerkId },
    { 
      stripeCustomerId: customerId,
      updatedAt: new Date()
    }
  );

  console.log(`Cliente actualizado para usuario: ${clerkId}`);
} 
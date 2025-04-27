import Stripe from 'stripe';

// Inicializar Stripe con la clave secreta del servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil', // Usar la versión compatible con el tipo
  typescript: true,
});

// Interfaz para crear una sesión de checkout
interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Crea una sesión de checkout para suscripciones
 */
async function createCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  customerId,
  customerEmail,
  metadata = {},
}: CreateCheckoutSessionParams) {
  // Configurar parámetros de la sesión
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  };

  // Si hay un customerId, utilizarlo, de lo contrario usar email para cliente nuevo
  if (customerId) {
    params.customer = customerId;
  } else if (customerEmail) {
    params.customer_email = customerEmail;
  }

  const session = await stripe.checkout.sessions.create(params);
  
  return {
    url: session.url,
    sessionId: session.id,
  };
}

// Interfaz para crear una sesión del portal de clientes
interface CreateCustomerPortalSessionParams {
  customerId: string;
  returnUrl: string;
}

/**
 * Crea una sesión del portal de clientes para gestionar suscripciones
 */
async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: CreateCustomerPortalSessionParams) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: session.url,
  };
}

/**
 * Obtiene una suscripción por ID
 */
async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Obtiene un cliente de Stripe por ID
 */
async function getCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Crea un cliente de Stripe
 */
async function createCustomer({
  email,
  name,
  metadata = {},
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Cancela una suscripción
 */
async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Obtener los detalles de un producto por su ID
 */
async function getProduct(productId: string) {
  try {
    const product = await stripe.products.retrieve(productId);
    return product;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
}

/**
 * Obtener los detalles de un precio por su ID
 */
async function getPrice(priceId: string) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price;
  } catch (error) {
    console.error('Error al obtener precio:', error);
    throw error;
  }
}

/**
 * Obtener todos los productos activos con sus precios
 */
async function getActiveProducts() {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return products.data;
  } catch (error) {
    console.error('Error al obtener productos activos:', error);
    throw error;
  }
}

/**
 * Verificar el estado de una suscripción
 */
function isSubscriptionActive(status: string) {
  return status === 'active' || status === 'trialing';
}

// Exportar las funciones y la instancia de stripe
export {
  stripe,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscription,
  getCustomer,
  createCustomer,
  cancelSubscription,
  getProduct,
  getPrice,
  getActiveProducts,
  isSubscriptionActive
}; 
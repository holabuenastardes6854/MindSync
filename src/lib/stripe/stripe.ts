import Stripe from 'stripe';

// Inicializar Stripe con la clave secreta del servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil', // La versión debe coincidir con la esperada por los tipos de Stripe
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
  try {
    // Verificar que tenemos la clave API de Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('La clave API de Stripe no está configurada');
    }

    // Verificar que el ID de precio tiene el formato correcto
    if (!priceId.startsWith('price_')) {
      throw new Error('Formato de ID de precio inválido. Debe comenzar con "price_"');
    }

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

    console.log('Creando sesión de checkout con parámetros:', JSON.stringify(params, null, 2));

    try {
      const session = await stripe.checkout.sessions.create(params);
      console.log('Sesión de checkout creada:', session.id);

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error: unknown) {
      // Verificar si el error es por cuenta suspendida
      if (error instanceof Error && error.message) {
        // Verificar si el error es por cuenta suspendida
        if (
          error.message.includes('account has been suspended') ||
          error.message.includes('account cannot create charges') ||
          error.message.includes('payments disabled')
        ) {
          console.error('Error: Cuenta de Stripe suspendida:', error.message);
          throw new Error(`Cuenta de Stripe suspendida: ${error.message}`);
        }

        // Verificar si es un error de "price not found"
        if (error.message.includes('No such price')) {
          console.error(`Error: El ID de precio '${priceId}' no existe en Stripe:`, error.message);
          throw new Error(`El ID de precio '${priceId}' no existe en Stripe. Verifica que estés usando un ID de precio válido.`);
        }
      }

      // Otros errores
      console.error('Error al crear sesión de checkout en Stripe:', error);
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error en createCheckoutSession:', error);
    throw error;
  }
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
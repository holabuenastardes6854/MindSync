'use client';

import { useState } from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Link from 'next/link';

// Datos de los planes de precios
const pricingData = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    description: 'Experimenta lo básico',
    features: [
      'Sesiones de 15 minutos',
      'Categoría Focus básica',
      'Uso de por vida',
      'Acceso limitado a pistas'
    ],
    limitaciones: [
      'Sin pistas premium',
      'Sin visualizaciones avanzadas',
      'Personalización limitada'
    ],
    buttonText: 'Comenzar Gratis',
    stripePriceId: null,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9,99',
    period: 'mes',
    description: 'Para uso regular',
    features: [
      'Todo lo de Free',
      'Sesiones de hasta 2 horas',
      'Todas las categorías',
      'Sin anuncios',
      'Más de 100 pistas',
      'Visualizaciones avanzadas'
    ],
    buttonText: 'Suscribirse',
    stripePriceId: 'price_premium',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '19,99',
    period: 'mes',
    description: 'Para uso profesional',
    features: [
      'Todo lo de Premium',
      'Sesiones personalizadas',
      'Descarga para uso offline',
      'Soporte prioritario',
      'Herramientas de análisis',
      'Mezclas personalizadas'
    ],
    buttonText: 'Suscribirse',
    stripePriceId: 'price_pro',
    popular: false
  }
];

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const { isSignedIn, userId } = useAuth();

  // Función para calcular el descuento anual (20%)
  const getAnnualPrice = (monthlyPrice: string) => {
    const price = parseFloat(monthlyPrice.replace(',', '.'));
    const annualPrice = (price * 12 * 0.8).toFixed(2).replace('.', ',');
    return annualPrice;
  };

  // Handler para checkout de Stripe
  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) return;

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
    }
  };

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Desbloquea el poder de la música funcional con nuestros planes diseñados para diferentes necesidades.
          </p>

          {/* Selector de período de facturación */}
          <div className="mt-8 inline-flex items-center bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md transition-all flex items-center ${
                billingPeriod === 'annual' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Anual
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-500 text-white rounded">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingData.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular 
                  ? 'border-2 border-purple-500 bg-gray-800' 
                  : 'border border-gray-700 bg-gray-800/80'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-sm">
                  Más popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">
                    {billingPeriod === 'monthly' ? plan.price : getAnnualPrice(plan.price)}€
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 ml-1">
                      /{billingPeriod === 'monthly' ? 'mes' : 'año'}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${plan.id}-${billingPeriod}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSignedIn ? (
                      <button
                        onClick={() => handleCheckout(plan.stripePriceId)}
                        disabled={!plan.stripePriceId}
                        className={`w-full py-3 rounded-lg transition-all font-medium ${
                          plan.stripePriceId 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {plan.buttonText}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <SignUpButton mode="modal">
                          <button
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all font-medium"
                          >
                            Registrarse
                          </button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                          <button
                            className="w-full py-2 text-gray-300 hover:text-white transition-colors text-sm"
                          >
                            Ya tienes cuenta? Iniciar sesión
                          </button>
                        </SignInButton>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                
                <div className="mt-8">
                  <p className="text-sm text-white mb-2 font-medium">
                    ¿Qué incluye?
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300 text-sm">
                        <Icon 
                          icon="heroicons:check-circle" 
                          className="mr-2 text-green-500 mt-0.5" 
                          width={16} 
                        />
                        {feature}
                      </li>
                    ))}
                    
                    {plan.limitaciones && (
                      <>
                        <li className="pt-2 mt-2 border-t border-gray-700">
                          <p className="text-sm text-white mb-2 font-medium">
                            Limitaciones:
                          </p>
                        </li>
                        {plan.limitaciones.map((limitation, index) => (
                          <li key={`limit-${index}`} className="flex items-start text-gray-400 text-sm">
                            <Icon 
                              icon="heroicons:x-mark" 
                              className="mr-2 text-red-500 mt-0.5" 
                              width={16} 
                            />
                            {limitation}
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm">
            Todas las suscripciones incluyen 7 días de prueba gratuita. <br />
            Puedes cancelar en cualquier momento.
          </p>
          <Link href="/faq" className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center mt-2">
            ¿Tienes preguntas? Ver nuestras FAQ
            <Icon icon="heroicons:arrow-right" className="ml-1" width={14} />
          </Link>
        </div>
      </div>
    </section>
  );
} 
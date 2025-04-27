'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { FadeIn } from '@/components/ui/FadeIn';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  stripePriceId: string;
  popular?: boolean;
  color?: string;
}

// Planes de precios con IDs de precio de Stripe
const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    interval: 'month',
    description: 'Ideal para probar nuestro servicio',
    stripePriceId: '', // No tiene ID porque es gratis
    features: [
      'Sesiones de 15 minutos',
      'Música básica',
      'Categoría Focus',
      'Acceso web',
    ],
    color: 'from-gray-400 to-gray-500',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    interval: 'month',
    description: 'La experiencia completa de MindSync',
    stripePriceId: 'prod_SCil3M61l8NOIS', // Obtén el price_* asociado a prod_SCijMuIfD0yLfg
    features: [
      'Sesiones ilimitadas',
      'Todas las categorías',
      'Sin anuncios',
      'Descarga de sesiones',
      'Acceso web y móvil',
      'Soporte prioritario',
    ],
    popular: true,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 44.99,
    interval: 'year',
    description: 'Ahorra con nuestro plan anual',
    stripePriceId: 'prod_SCimjeplnv9x2X', // Obtén el price_* asociado a prod_SCik7dCTs920Rr
    features: [
      'Todo lo incluido en Premium',
      'Dos meses gratis',
      'Sesiones personalizadas',
      'API de integración',
      'Estadísticas avanzadas',
    ],
    color: 'from-blue-500 to-cyan-600',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (plan: PricingPlan) => {
    // Si es el plan gratuito, no hay checkout
    if (plan.id === 'basic') {
      router.push('/dashboard');
      return;
    }

    try {
      setLoading(plan.id);
      setError(null);
      
      if (!plan.stripePriceId) {
        setError(`ID de precio no disponible para el plan ${plan.name}`);
        setLoading(null);
        return;
      }
      
      console.log(`Iniciando checkout para el plan: ${plan.id}, priceId: ${plan.stripePriceId}`);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta de API:', errorText);
        throw new Error(`Error al crear sesión de checkout: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error creating checkout session:', data.error);
        setError(data.error);
        setLoading(null);
        return;
      }
      
      // Redirigir a la página de checkout de Stripe
      if (data.url) {
        console.log('Redirigiendo a:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      let errorMessage = 'Error al procesar el pago. Por favor, inténtalo de nuevo.';
      
      // Extraer el mensaje de error si está disponible
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Planes para todos los <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">objetivos</span>
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades. Todas las suscripciones incluyen una garantía de devolución de 30 días.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Planes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <FadeIn 
              key={plan.id} 
              delay={index * 0.1}
              className="h-full"
            >
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative h-full rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-xl flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Popular
                    </div>
                  </div>
                )}
                
                {/* Fondo decorativo */}
                <div 
                  className="absolute inset-0 opacity-10 bg-gradient-to-br pointer-events-none" 
                  style={{ 
                    background: `linear-gradient(to bottom right, ${plan.color?.split(' ')[0].replace('from-', '')}, ${plan.color?.split(' ')[1].replace('to-', '')})` 
                  }}
                />
                
                <div className="p-6 md:p-8 flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-end mb-4">
                    <AnimatedText 
                      text={`$${plan.price}`} 
                      effect="fade"
                      className="text-4xl font-extrabold text-white"
                    />
                    <span className="text-gray-400 ml-2 mb-1">
                      /{plan.interval === 'month' ? 'mes' : 'año'}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Icon 
                          icon="lucide:check-circle" 
                          className={`mt-1 mr-2 flex-shrink-0 ${
                            plan.popular ? 'text-purple-400' : 'text-blue-400'
                          }`} 
                        />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-6 md:px-8 md:pb-8 pt-0">
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.id}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                      ${plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        : plan.id === 'basic'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      }
                      ${loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                  >
                    {loading === plan.id ? (
                      <div className="flex justify-center items-center">
                        <Icon icon="svg-spinners:180-ring" className="animate-spin mr-2" />
                        Procesando...
                      </div>
                    ) : (
                      plan.id === 'basic' ? 'Comenzar gratis' : 'Suscribirse'
                    )}
                  </button>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Preguntas frecuentes</h2>
        </div>
        
        <div className="space-y-8">
          <FaqItem 
            question="¿Cómo funciona el período de prueba?" 
            answer="Todas las suscripciones incluyen una garantía de devolución de 30 días. Si no estás satisfecho con el servicio, contacta a nuestro equipo de soporte para obtener un reembolso completo." 
          />
          <FaqItem 
            question="¿Puedo cambiar de plan en cualquier momento?" 
            answer="Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control. Si actualizas, se te cobrará la diferencia prorrateada. Si reduces, el cambio tomará efecto al final del ciclo de facturación actual." 
          />
          <FaqItem 
            question="¿Qué métodos de pago aceptan?" 
            answer="Aceptamos todas las tarjetas de crédito principales (Visa, MasterCard, American Express) y también ofrecemos pago con PayPal y criptomonedas seleccionadas." 
          />
          <FaqItem 
            question="¿Cómo puedo cancelar mi suscripción?" 
            answer="Puedes cancelar tu suscripción en cualquier momento desde la sección 'Configuración' de tu cuenta. La cancelación tomará efecto al final del ciclo de facturación actual." 
          />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        <Icon 
          icon={isOpen ? "lucide:minus" : "lucide:plus"} 
          className="flex-shrink-0 text-gray-400"
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-4 bg-gray-800/50"
        >
          <p className="text-gray-300">{answer}</p>
        </motion.div>
      )}
    </div>
  );
} 
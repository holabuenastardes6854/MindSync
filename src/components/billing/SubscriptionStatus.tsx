'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionStatus() {
  const { userId } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo cargar si el usuario está autenticado
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription/get-status');
        
        if (!response.ok) {
          throw new Error('Error al obtener información de suscripción');
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar suscripción:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  // Función para manejar la redirección al portal de clientes de Stripe
  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión del portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error al redirigir al portal de clientes:', error);
    }
  };

  // Renderizar diferentes estados
  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
        <div className="flex items-center text-red-400 mb-2">
          <Icon icon="heroicons:exclamation-circle" className="mr-2" width={20} />
          <h3 className="font-medium">Error al cargar la suscripción</h3>
        </div>
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    );
  }

  if (!subscription || subscription.plan === 'free') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">Plan Free</h3>
          <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs">
            Activo
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Estás utilizando el plan gratuito con funcionalidades limitadas. Actualiza para acceder a todas las características.
        </p>
        <button 
          onClick={() => window.location.href = '/pricing'}
          className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors font-medium"
        >
          Actualizar Plan
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-lg text-white">
          Plan {subscription.plan === 'premium' ? 'Premium' : 'Pro'}
        </h3>
        <StatusBadge status={subscription.status} />
      </div>
      
      {subscription.cancelAtPeriodEnd ? (
        <p className="text-yellow-300 text-sm mb-3 flex items-center">
          <Icon icon="heroicons:clock" className="mr-1" width={16} />
          Tu suscripción finalizará el {formatDate(subscription.currentPeriodEnd)}
        </p>
      ) : (
        <p className="text-gray-400 text-sm mb-3">
          Próxima facturación: {formatDate(subscription.currentPeriodEnd)}
        </p>
      )}
      
      <button 
        onClick={handleManageSubscription}
        className="w-full py-2 mt-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors text-sm"
      >
        Gestionar Suscripción
      </button>
    </motion.div>
  );
}

// Componente auxiliar para mostrar el estado
function StatusBadge({ status }: { status: string }) {
  // Configurar apariencia según el estado
  let bgColor = 'bg-gray-700';
  let textColor = 'text-gray-300';
  let label = 'Desconocido';

  switch (status) {
    case 'active':
      bgColor = 'bg-green-500/20';
      textColor = 'text-green-400';
      label = 'Activa';
      break;
    case 'trialing':
      bgColor = 'bg-blue-500/20';
      textColor = 'text-blue-400';
      label = 'En prueba';
      break;
    case 'canceled':
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-400';
      label = 'Cancelada';
      break;
    case 'past_due':
      bgColor = 'bg-orange-500/20';
      textColor = 'text-orange-400';
      label = 'Pago pendiente';
      break;
    case 'incomplete':
      bgColor = 'bg-yellow-500/20';
      textColor = 'text-yellow-400';
      label = 'Incompleta';
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
      {label}
    </span>
  );
}

// Función para formatear fechas
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
} 
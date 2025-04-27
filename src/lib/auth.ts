import { clerkClient } from '@clerk/nextjs';

/**
 * Obtiene información del usuario autenticado incluyendo datos personalizados como stripeCustomerId
 * @param userId ID del usuario de Clerk
 * @returns Información del usuario con metadatos adicionales
 */
export async function getAuthUser(userId: string) {
  try {
    // Obtener el usuario desde Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Extraer stripeCustomerId de los metadatos públicos o privados del usuario
    const stripeCustomerId = 
      user.privateMetadata.stripeCustomerId as string || 
      user.publicMetadata.stripeCustomerId as string;
    
    // Construir y devolver el objeto de usuario con la información relevante
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      stripeCustomerId
    };
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return null;
  }
} 
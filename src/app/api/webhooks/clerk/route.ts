import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { createUser, updateUser, deleteUser, getUserByClerkId, User } from '@/models/User';
import { createDefaultSubscription, getSubscriptionByUserId, deleteSubscription } from '@/models/Subscription';
import { archiveDeletedUser, DeletedUser } from '@/models/DeletedUser';

export async function POST(req: Request) {
  const payload = await req.text();
  console.log('payload', payload);
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // Validar que existan los encabezados de Svix
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Error: Encabezados de webhook incorrectos', {
      status: 400
    });
  }

  // Verificar la firma del webhook usando Svix
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    return new NextResponse('Error: Falta la clave secreta del webhook de Clerk', {
      status: 500
    });
  }

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error al verificar webhook:', err);
    return new NextResponse('Error: Fallo en la verificación del webhook', {
      status: 400
    });
  }

  const eventType = evt.type;
  console.log(`Procesando webhook de Clerk: ${eventType}`);

  try {
    // Conectar a la base de datos
    await connectToDatabase();

    // Procesar eventos según su tipo
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0]?.email_address;
      
      if (!email) {
        return new NextResponse('Error: Usuario sin dirección de correo electrónico', {
          status: 400
        });
      }
      
      const nameStr = `${first_name || ''} ${last_name || ''}`.trim();
      
      // Crear objeto de usuario con tipado correcto
      const userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'> = {
        clerkId: id,
        email,
        plan: 'free',
        stats: {
          totalSessionsCompleted: 0,
          totalMinutesListened: 0,
          streakDays: 0,
          categoriesUsage: {
            focus: 0,
            relax: 0,
            sleep: 0
          }
        },
        preferences: {
          favoriteCategory: undefined,
          preferredDuration: 30,
          volume: 80,
          interfaceTheme: 'dark',
          notificationsEnabled: true,
          weeklyReportEnabled: true
        }
      };
      
      // Solo agregar el nombre si existe
      if (nameStr) {
        userData.name = nameStr;
      }
      
      // Crear el usuario en MongoDB
      const newUser = await createUser(userData);
      
      // Crear una suscripción gratuita por defecto
      if (newUser && newUser._id) {
        await createDefaultSubscription(id);
        console.log(`Suscripción gratuita creada para el usuario: ${id}`);
      }
      
      console.log(`Usuario creado en MongoDB: ${id}`);
    }
    else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      
      if (!email) {
        return new NextResponse('Error: Usuario sin dirección de correo electrónico', {
          status: 400
        });
      }
      
      const nameStr = `${first_name || ''} ${last_name || ''}`.trim();
      
      // Crear objeto de actualización con tipado correcto
      const updateData: Partial<Omit<User, '_id' | 'clerkId' | 'createdAt'>> = {
        email
      };
      
      // Solo agregar el nombre si existe
      if (nameStr) {
        updateData.name = nameStr;
      }
      
      // id es siempre string aquí, proveniente de Clerk
      await updateUser(id as string, updateData);
      
      console.log(`Usuario actualizado en MongoDB: ${id}`);
    }
    else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      const clerkId = id as string;
      
      // Obtener datos completos del usuario antes de eliminarlo
      const user = await getUserByClerkId(clerkId);
      
      if (user) {
        // Obtener datos de suscripción del usuario
        const subscription = await getSubscriptionByUserId(clerkId);
        
        // Preparar datos para archivar
        const archivedUserData: Omit<DeletedUser, '_id'> = {
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
          stripeCustomerId: user.stripeCustomerId,
          plan: user.plan,
          deletedAt: new Date(),
          createdAt: user.createdAt,
          usageStats: {
            totalSessionsCompleted: user.stats?.totalSessionsCompleted,
            totalMinutesListened: user.stats?.totalMinutesListened,
            categoriesUsage: user.stats?.categoriesUsage
          },
          subscriptionInfo: subscription ? {
            plan: subscription.plan,
            status: subscription.status,
            cancelReason: subscription.cancelReason
          } : undefined,
          deletionSource: 'user' as const // Definir explícitamente como un literal de tipo 'user'
        };
        
        // Guardar en la colección de usuarios eliminados
        await archiveDeletedUser(archivedUserData);
        console.log(`Datos del usuario archivados antes de eliminar: ${clerkId}`);
      }
      
      // Eliminar el usuario de la colección principal
      await deleteUser(clerkId);
      
      // Eliminar la suscripción del usuario
      await deleteSubscription(clerkId);
      
      console.log(`Usuario y suscripción eliminados de MongoDB: ${clerkId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de Clerk:', error);
    return new NextResponse('Error interno al procesar webhook', {
      status: 500
    });
  }
} 
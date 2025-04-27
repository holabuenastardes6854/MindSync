import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb/connection';
import UserModel from '@/models/User';

export async function POST(req: Request) {
  // Obtener el cuerpo de la solicitud y encabezados
  const payload = await req.text();
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
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      await UserModel.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim() || undefined
      });
      
      console.log(`Usuario creado en MongoDB: ${id}`);
    }
    else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      await UserModel.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || undefined,
          updatedAt: new Date()
        },
        { upsert: true }
      );
      
      console.log(`Usuario actualizado en MongoDB: ${id}`);
    }
    else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      await UserModel.findOneAndDelete({ clerkId: id });
      
      console.log(`Usuario eliminado de MongoDB: ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de Clerk:', error);
    return new NextResponse('Error interno al procesar webhook', {
      status: 500
    });
  }
} 
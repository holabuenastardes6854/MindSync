import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { getUserByClerkId, updateUser } from '@/models/User';

export async function PUT(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { preferences } = body;
    
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Se requiere un objeto de preferencias válido.' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    await connectToDatabase();
    
    // Obtener usuario actual
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos.' },
        { status: 404 }
      );
    }
    
    // Actualizar preferencias del usuario
    const updatedUser = await updateUser(userId, {
      preferences: {
        ...user.preferences,
        ...preferences
      }
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'No se pudieron actualizar las preferencias.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Error al actualizar preferencias de usuario:', error);
    
    return NextResponse.json(
      { error: 'Error al actualizar preferencias de usuario' },
      { status: 500 }
    );
  }
} 
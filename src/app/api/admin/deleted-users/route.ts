import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { getDeletedUsers, getDeletedUserStats } from '@/models/DeletedUser';

// Lista de IDs de usuarios con permisos de administrador
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

/**
 * Verificar si el usuario actual es administrador
 */
function isAdmin(userId: string | null): boolean {
  return Boolean(userId && ADMIN_USER_IDS.includes(userId));
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const sortBy = searchParams.get('sortBy') || 'deletedAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const fromDate = searchParams.get('fromDate') ? new Date(searchParams.get('fromDate')!) : undefined;
    const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined;
    const deletionSource = searchParams.get('source') as 'user' | 'admin' | 'system' || undefined;
    const includeStats = searchParams.get('stats') === 'true';

    // Conectar a MongoDB
    await connectToDatabase();

    // Obtener usuarios eliminados
    const deletedUsers = await getDeletedUsers({
      limit: Math.min(limit, 100), // Limitar a máximo 100 registros por solicitud
      skip,
      sortBy,
      sortOrder,
      fromDate,
      toDate,
      deletionSource
    });

    // Preparar respuesta
    const response: any = {
      users: deletedUsers.map(user => ({
        ...user,
        _id: user._id?.toString()
      })),
      pagination: {
        limit,
        skip,
        total: deletedUsers.length,
        hasMore: deletedUsers.length === limit
      }
    };

    // Incluir estadísticas si se solicitan
    if (includeStats) {
      response.stats = await getDeletedUserStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener usuarios eliminados:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener usuarios eliminados' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener estadísticas de usuarios eliminados
 */
export async function HEAD(request: Request) {
  try {
    // Verificar autenticación y permisos
    const { userId } = auth();
    if (!userId || !isAdmin(userId)) {
      return new NextResponse(null, { status: 403 });
    }

    // Conectar a MongoDB
    await connectToDatabase();
    
    // Obtener estadísticas
    const stats = await getDeletedUserStats();
    
    // Responder con estadísticas en headers para una respuesta ligera
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Deleted': stats.totalDeleted.toString(),
        'X-By-Source': JSON.stringify(stats.bySource),
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios eliminados:', error);
    return new NextResponse(null, { status: 500 });
  }
} 
import type { APIRoute } from 'astro';
import { Database } from '@/lib/db';
import { clerkClient } from '@clerk/astro/server';

export const PUT: APIRoute = async (context) => {
  const section = context.params.section as string;
  try {
    // Verificar autenticación
    const { userId } = context.locals.auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que el usuario sea admin
    const user = await clerkClient(context).users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Acceso denegado. Se requieren permisos de administrador.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await context.request.json();
    const { value } = body;

    if (!value) {
      return new Response(JSON.stringify({ error: 'Value es requerido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const setting = await Database.setSetting(section, JSON.stringify(value));

    console.log(`Configuración actualizada para ${section}:`, setting);

    return new Response(JSON.stringify(setting), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error(`Error al actualizar la configuración de ${section}:`, error);

    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

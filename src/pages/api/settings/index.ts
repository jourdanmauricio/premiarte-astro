import type { APIRoute } from 'astro';
import { Database } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/utils';

// GET - Obtener todas las configuraciones
export const GET: APIRoute = async (context) => {
  try {
    // GET público - no requiere autenticación para mostrar configuraciones en el sitio
    const settings = await Database.getAllSettings();

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener las configuraciones' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// POST - Crear o actualizar configuración
export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await context.request.json();
    const { key, value } = body;

    if (!key || !value) {
      return new Response(
        JSON.stringify({ error: 'Key y value son requeridos' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const setting = await Database.setSetting(key, value);

    return new Response(JSON.stringify(setting), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al configurar setting:', error);
    return new Response(
      JSON.stringify({ error: 'Error al guardar la configuración' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

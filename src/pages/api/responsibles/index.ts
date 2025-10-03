import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

export const GET: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const responsiblesData = await Database.getAllResponsibles();

    const responsibles = responsiblesData.sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''))
    );

    return new Response(JSON.stringify(responsibles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener responsables:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST - Crear nuevo responsable
export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener datos del body
    const body = await context.request.json();
    const { name, cuit, condition, observation } = body;

    // Validaciones básicas
    if (!name || !cuit || !condition) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: name, cuit, condition',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar formato de CUIT (básico)
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(cuit)) {
      return new Response(
        JSON.stringify({
          error: 'El CUIT debe tener el formato XX-XXXXXXXX-X',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear el responsable
    const newResponsible = await Database.createResponsible({
      name,
      cuit,
      condition,
      observation,
    });

    return new Response(JSON.stringify(newResponsible), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al crear responsable:', error);

    // Manejar errores de constraint (CUIT duplicado)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un responsable con ese CUIT' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

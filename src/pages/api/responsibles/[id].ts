import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

export const GET: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const id = parseInt(context.params.id || '0');
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ error: 'ID de responsable inválido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const responsible = await Database.getResponsibleById(id);
    if (!responsible) {
      return new Response(
        JSON.stringify({ error: 'Responsable no encontrado' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(responsible), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener responsable:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PUT - Actualizar responsable
export const PUT: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const id = parseInt(context.params.id || '0');
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ error: 'ID de responsable inválido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que el responsable existe
    const existingResponsible = await Database.getResponsibleById(id);
    if (!existingResponsible) {
      return new Response(
        JSON.stringify({ error: 'Responsable no encontrado' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // Actualizar el responsable
    const updatedResponsible = await Database.updateResponsible(id, {
      name,
      cuit,
      condition,
      observation,
    });

    return new Response(JSON.stringify(updatedResponsible), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar responsable:', error);

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

// DELETE - Eliminar responsable
export const DELETE: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const id = parseInt(context.params.id || '0');
    if (isNaN(id) || id <= 0) {
      return new Response(
        JSON.stringify({ error: 'ID de responsable inválido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que el responsable existe
    const existingResponsible = await Database.getResponsibleById(id);
    if (!existingResponsible) {
      return new Response(
        JSON.stringify({ error: 'Responsable no encontrado' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar si tiene presupuestos asociados
    const budgetCount = await Database.countBudgetsByResponsible(id);
    if (budgetCount && Number(budgetCount) > 0) {
      return new Response(
        JSON.stringify({
          error: `No se puede eliminar el responsable porque tiene ${budgetCount} presupuesto(s) asociado(s)`,
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Eliminar el responsable
    await Database.deleteResponsible(id);

    return new Response(
      JSON.stringify({ message: 'Responsable eliminado correctamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar responsable:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

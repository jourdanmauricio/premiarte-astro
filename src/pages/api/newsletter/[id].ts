import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

// PUT - Actualizar suscriptor existente
export const PUT: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del suscriptor
    const newsletterId = parseInt(context.params.id as string);

    if (isNaN(newsletterId)) {
      return new Response(
        JSON.stringify({ error: 'ID de newsletter inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el suscriptor existe
    const existingNewsletter = await Database.getNewsletterById(newsletterId);

    if (!existingNewsletter) {
      return new Response(
        JSON.stringify({ error: 'Suscriptor no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await context.request.json();

    const { isActive } = body;

    // Preparar datos para actualizar (solo campos que se proporcionaron)
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;

    // Actualizar el suscriptor
    const updatedNewsletter = await Database.updateNewsletter(
      newsletterId,
      updateData
    );

    return new Response(JSON.stringify(updatedNewsletter), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar suscriptor:', error);

    // Manejar errores de constraint
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un suscriptor con ese email' }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

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

// DELETE - Eliminar suscriptor
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del suscriptor
    const newsletterId = parseInt(context.params.id as string);

    if (isNaN(newsletterId)) {
      return new Response(
        JSON.stringify({ error: 'ID de suscriptor inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el suscriptor existe
    const existingNewsletter = await Database.getNewsletterById(newsletterId);

    if (!existingNewsletter) {
      return new Response(
        JSON.stringify({ error: 'Suscriptor no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await Database.deleteNewsletter(newsletterId);

    return new Response(
      JSON.stringify({ message: 'Suscriptor eliminado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar suscriptor:', error);
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

import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

// DELETE - Eliminar contacto
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del contacto
    const contactId = parseInt(context.params.id as string);

    if (isNaN(contactId)) {
      return new Response(
        JSON.stringify({ error: 'ID de contacto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el contacto existe
    const existingContact = await Database.getContactById(contactId);

    if (!existingContact) {
      return new Response(JSON.stringify({ error: 'Contacto no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    await Database.deleteContact(contactId);

    return new Response(
      JSON.stringify({ message: 'Contacto eliminado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
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

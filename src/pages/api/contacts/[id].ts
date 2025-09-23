import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

// PUT - Actualizar contacto existente
// export const PUT: APIRoute = async (context) => {
//   try {
//     // Verificar autenticación
//     const authResult = await verifyAdminAuth(context);
//     if (!authResult.success) {
//       return authResult.response;
//     }

//     // Obtener ID del contacto
//     const contactId = parseInt(context.params.id as string);

//     if (isNaN(contactId)) {
//       return new Response(
//         JSON.stringify({ error: 'ID de contacto inválido' }),
//         {
//           status: 400,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     }

//     // Verificar que el contacto existe
//     const existingContact = await Database.getContactById(contactId);

//     if (!existingContact) {
//       return new Response(
//           JSON.stringify({ error: 'Contacto no encontrado' }),
//         {
//           status: 404,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     }

//     // Obtener datos del cuerpo de la petición
//     const body = await context.request.json();

//     const { isActive } = body;

//     // Preparar datos para actualizar (solo campos que se proporcionaron)
//     const updateData: any = {};
//     if (isActive !== undefined) updateData.isActive = isActive;

//     // Actualizar el contacto
//     const updatedContact = await Database.updateContact(
//       contactId,
//       updateData
//     );

//     return new Response(JSON.stringify(updatedContact), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error: any) {
//     console.error('Error al actualizar contacto:', error);

//     // Manejar errores de constraint
//     if (error.message?.includes('UNIQUE constraint failed')) {
//       return new Response(
//         JSON.stringify({ error: 'Ya existe un contacto con ese email' }),
//         {
//           status: 409,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     }

//     return new Response(
//       JSON.stringify({ error: 'Error interno del servidor' }),
//       {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//   }
// };

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

    // Verificar que el suscriptor existe
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

import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

// GET - Obtener cliente por ID
export const GET: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const customerId = parseInt(context.params.id as string);
    const customer = await Database.getCustomerById(customerId);
    return new Response(JSON.stringify(customer), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
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

// PUT - Actualizar categoría existente
export const PUT: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID de la cliente
    const customerId = parseInt(context.params.id as string);

    if (isNaN(customerId)) {
      return new Response(JSON.stringify({ error: 'ID de cliente inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que la categoría existe
    const existingCustomer = await Database.getCustomerById(customerId);

    if (!existingCustomer) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Obtener datos del cuerpo de la petición
    const body = await context.request.json();
    const { name, email, phone, type, document, address, observation } = body;

    // Si se proporciona un slug, verificar que no esté duplicado
    if (email && email !== existingCustomer.email) {
      const emailExists = await Database.getCustomerByEmail(email);

      if (emailExists) {
        return new Response(
          JSON.stringify({ error: 'Ya existe un cliente con ese email' }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Preparar datos para actualizar (solo campos que se proporcionaron)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (type !== undefined) updateData.type = type;
    if (document !== undefined) updateData.document = document;
    if (address !== undefined) updateData.address = address;
    if (observation !== undefined) updateData.observation = observation;

    // Actualizar la cliente
    const updatedCustomer = await Database.updateCustomer(
      customerId,
      updateData
    );

    return new Response(JSON.stringify(updatedCustomer), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);

    // Manejar errores de constraint (email duplicado)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un cliente con ese email' }),
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

// DELETE - Eliminar categoría
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID de la cliente
    const customerId = parseInt(context.params.id as string);

    if (isNaN(customerId)) {
      return new Response(JSON.stringify({ error: 'ID de cliente inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que la cliente existe
    const existingCustomer = await Database.getCustomerById(customerId);

    if (!existingCustomer) {
      return new Response(
        JSON.stringify({ error: 'Categoría no encontrada' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar si hay presupuestos asociados a esta cliente
    const budgetsCount = Number(
      await Database.countBudgetsByCustomer(customerId)
    );

    if (budgetsCount > 0) {
      return new Response(
        JSON.stringify({
          error: `No se puede eliminar la categoría porque tiene ${budgetsCount} presupuesto(s) asociado(s)`,
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Eliminar la cliente
    await Database.deleteCustomer(customerId);

    return new Response(
      JSON.stringify({ message: 'Cliente eliminada exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
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

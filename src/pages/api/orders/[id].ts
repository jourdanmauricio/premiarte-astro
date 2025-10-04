import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

// GET - Obtener presupuesto por ID
export const GET: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del presupuesto
    const orderId = parseInt(context.params.id as string);

    if (isNaN(orderId)) {
      return new Response(JSON.stringify({ error: 'ID de pedido inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Obtener el presupuesto
    const order = await Database.getOrderById(orderId);

    if (!order) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
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

// PUT - Actualizar presupuesto existente
export const PUT: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del presupuesto
    const orderId = parseInt(context.params.id as string);

    if (isNaN(orderId)) {
      return new Response(JSON.stringify({ error: 'ID de pedido inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que el presupuesto existe
    const existingOrder = await Database.getOrderById(orderId);

    if (!existingOrder) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Obtener datos del cuerpo de la petición
    const body = await context.request.json();
    const { observation, totalAmount, items, status, type } = body;

    // Preparar datos para actualizar (solo campos que se proporcionaron)
    const updateData: any = {};
    if (observation !== undefined) updateData.observation = observation;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (items !== undefined) updateData.items = items;

    // Actualizar el presupuesto
    const updatedOrder = await Database.updateOrder(orderId, updateData);

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
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

// DELETE - Eliminar pedido
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del presupuesto
    const orderId = parseInt(context.params.id as string);

    if (isNaN(orderId)) {
      return new Response(JSON.stringify({ error: 'ID de pedido inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que el presupuesto existe
    const existingOrder = await Database.getOrderById(orderId);

    if (!existingOrder) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    await Database.deleteOrder(orderId);

    return new Response(
      JSON.stringify({ message: 'Pedido eliminado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
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

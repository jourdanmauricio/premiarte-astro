import { Database } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/utils';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }
    // GET público - no requiere autenticación para mostrar productos en el sitio
    const orders = await Database.getAllOrders();

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await context.request.json();
    const {
      customerId,
      type,
      status,
      totalAmount,
      observation,
      items,
      expiresAt,
    } = body;

    if (!customerId || !type || !status || !totalAmount || !items) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const order = await Database.createOrder({
      customerId,
      type,
      status,
      totalAmount,
      observation,
      items,
    });

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Error al crear el pedido' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(order), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

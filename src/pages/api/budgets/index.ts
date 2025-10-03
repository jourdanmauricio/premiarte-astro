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
    const budgets = await Database.getAllBudgets();

    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener los presupuestos:', error);
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
      responsibleId,
    } = body;

    if (
      !customerId ||
      !type ||
      !status ||
      !totalAmount ||
      !items ||
      !responsibleId
    ) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const budget = await Database.createBudget({
      customerId,
      type,
      status,
      totalAmount,
      observation,
      expiresAt,
      userId: authResult.user.id,
      items,
      responsibleId,
    });

    if (!budget) {
      return new Response(
        JSON.stringify({ error: 'Error al crear el presupuesto' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(budget), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el presupuesto:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

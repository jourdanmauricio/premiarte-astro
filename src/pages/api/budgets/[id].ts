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
    const budgetId = parseInt(context.params.id as string);

    if (isNaN(budgetId)) {
      return new Response(
        JSON.stringify({ error: 'ID de presupuesto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener el presupuesto
    const budget = await Database.getBudgetById(budgetId);

    if (!budget) {
      return new Response(
        JSON.stringify({ error: 'Presupuesto no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(budget), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener el presupuesto:', error);
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
    const budgetId = parseInt(context.params.id as string);

    if (isNaN(budgetId)) {
      return new Response(
        JSON.stringify({ error: 'ID de presupuesto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el presupuesto existe
    const existingBudget = await Database.getBudgetById(budgetId);

    if (!existingBudget) {
      return new Response(
        JSON.stringify({ error: 'Presupuesto no encontrado' }),
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
    const {
      observation,
      totalAmount,
      items,
      status,
      type,
      expiresAt,
      responsibleId,
    } = body;

    // Preparar datos para actualizar (solo campos que se proporcionaron)
    const updateData: any = {};
    if (observation !== undefined) updateData.observation = observation;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    if (items !== undefined) updateData.items = items;
    if (responsibleId !== undefined) updateData.responsibleId = responsibleId;

    // Actualizar el presupuesto
    const updatedBudget = await Database.updateBudget(budgetId, updateData);

    return new Response(JSON.stringify(updatedBudget), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
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

// DELETE - Eliminar presupuesto
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID del presupuesto
    const budgetId = parseInt(context.params.id as string);

    if (isNaN(budgetId)) {
      return new Response(
        JSON.stringify({ error: 'ID de presupuesto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el presupuesto existe
    const existingBudget = await Database.getBudgetById(budgetId);

    if (!existingBudget) {
      return new Response(
        JSON.stringify({ error: 'Presupuesto no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await Database.deleteBudget(budgetId);

    return new Response(
      JSON.stringify({ message: 'Presupuesto eliminado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
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

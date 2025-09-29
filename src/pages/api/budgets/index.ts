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

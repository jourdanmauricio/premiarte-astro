import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

export const GET: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const responsiblesData = await Database.getResponsiblesWithBudgetCount();

    const responsibles = responsiblesData.sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''))
    );

    return new Response(JSON.stringify(responsibles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener responsables con conteo:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

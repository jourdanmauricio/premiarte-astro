import type { APIRoute } from 'astro';
import { Database } from '@/lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // GET público - no requiere autenticación para mostrar productos en el sitio
    const products = await Database.getAllProducts();

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

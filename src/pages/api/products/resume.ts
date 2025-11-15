import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Obtener todos los productos
    const products = await Database.getResumeProducts();

    // Devolver solo los campos esenciales para un resumen
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener productos resumidos:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};


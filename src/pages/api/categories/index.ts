import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // GET público - no requiere autenticación para mostrar categorías en el sitio
    const categories = await Database.getAllCategories();

    console.log('categories', categories);

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST - Crear nueva categoría
export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const { userId } = context.locals.auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que el usuario sea admin
    const user = await clerkClient(context).users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Acceso denegado. Se requieren permisos de administrador.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener datos del body
    const body = await context.request.json();
    const { name, slug, description, imageId, featured } = body;

    // Validaciones básicas
    if (!name || !slug || !description || !imageId) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: name, slug, description, imageId',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear la categoría
    const newCategory = await Database.createCategory({
      name,
      slug,
      description,
      imageId: parseInt(imageId),
      featured: Boolean(featured),
    });

    return new Response(JSON.stringify(newCategory), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al crear categoría:', error);

    // Manejar errores de constraint (slug duplicado)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe una categoría con ese slug' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

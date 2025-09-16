import { prisma } from '@/lib/prisma';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Verificar autenticación
    const auth = locals.auth();
    if (!auth?.userId) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        image: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

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

    // Obtener datos del cuerpo de la petición
    const body = await context.request.json();
    const { name, slug, description, imageId, featured = false } = body;

    // Validar campos requeridos
    if (!name || !slug || !description || !imageId) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: name, slug, description, imageId',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el slug no esté duplicado
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return new Response(
        JSON.stringify({ error: 'Ya existe una categoría con ese slug' }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que la imagen existe
    const imageExists = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!imageExists) {
      return new Response(
        JSON.stringify({ error: 'La imagen especificada no existe' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Crear la nueva categoría
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageId: parseInt(imageId),
        featured: Boolean(featured),
      },
      include: {
        image: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(newCategory), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return new Response(
          JSON.stringify({ error: 'Ya existe una categoría con ese slug' }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
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

import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';
import { verifyAdminAuth } from '@/lib/utils';

// PUT - Actualizar categoría existente
export const PUT: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID de la categoría
    const categoryId = parseInt(context.params.id as string);

    if (isNaN(categoryId)) {
      return new Response(
        JSON.stringify({ error: 'ID de categoría inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que la categoría existe
    const existingCategory = await Database.getCategoryById(categoryId);

    if (!existingCategory) {
      return new Response(
        JSON.stringify({ error: 'Categoría no encontrada' }),
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
    const { name, slug, description, imageId, featured } = body;

    // Si se proporciona un slug, verificar que no esté duplicado
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await Database.getCategoryBySlug(slug);

      if (slugExists) {
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

    // Si se proporciona un imageId, verificar que la imagen existe
    if (imageId) {
      const imageExists = await Database.getImageById(parseInt(imageId));

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
    }

    // Preparar datos para actualizar (solo campos que se proporcionaron)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (imageId !== undefined) updateData.imageId = parseInt(imageId);
    if (featured !== undefined) updateData.featured = Boolean(featured);

    // Actualizar la categoría
    const updatedCategory = await Database.updateCategory(
      categoryId,
      updateData
    );

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar categoría:', error);

    // Manejar errores de constraint
    if (error.message?.includes('UNIQUE constraint failed')) {
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

// DELETE - Eliminar categoría
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener ID de la categoría
    const categoryId = parseInt(context.params.id as string);

    if (isNaN(categoryId)) {
      return new Response(
        JSON.stringify({ error: 'ID de categoría inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que la categoría existe
    const existingCategory = await Database.getCategoryById(categoryId);

    if (!existingCategory) {
      return new Response(
        JSON.stringify({ error: 'Categoría no encontrada' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar si hay productos asociados a esta categoría
    const productsCount = Number(
      await Database.countProductsByCategory(categoryId)
    );

    if (productsCount > 0) {
      return new Response(
        JSON.stringify({
          error: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`,
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Eliminar la categoría
    await Database.deleteCategory(categoryId);

    return new Response(
      JSON.stringify({ message: 'Categoría eliminada exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
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

import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

// PUT - Actualizar producto existente
export const PUT: APIRoute = async (context) => {
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

    // Obtener ID del producto
    const productId = parseInt(context.params.id as string);

    if (isNaN(productId)) {
      return new Response(
        JSON.stringify({ error: 'ID de producto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el producto existe
    const existingProduct = await Database.getProductById(productId);

    if (!existingProduct) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
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
      name,
      slug,
      description,
      price,
      stock,
      isActive,
      isFeatured,
      retailPrice,
      wholesalePrice,
      discount,
      discountType,
      images,
      categories,
      relatedProducts
    } = body;

    // Si se proporciona un slug, verificar que no esté duplicado
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await Database.getProductBySlug(slug);

      if (slugExists) {
        return new Response(
          JSON.stringify({ error: 'Ya existe un producto con ese slug' }),
          {
            status: 409,
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
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (retailPrice !== undefined) updateData.retailPrice = parseFloat(retailPrice);
    if (wholesalePrice !== undefined) updateData.wholesalePrice = parseFloat(wholesalePrice);
    if (discount !== undefined) updateData.discount = parseFloat(discount);
    if (discountType !== undefined) updateData.discountType = discountType;
    if (images !== undefined) updateData.images = images;
    if (categories !== undefined) updateData.categories = categories;
    if (relatedProducts !== undefined) updateData.relatedProducts = relatedProducts;

    // Actualizar el producto
    const updatedProduct = await Database.updateProduct(
      productId,
      updateData
    );

    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);

    // Manejar errores de constraint
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un producto con ese slug' }),
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

// DELETE - Eliminar producto
export const DELETE: APIRoute = async (context) => {
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

    // Obtener ID del producto
    const productId = parseInt(context.params.id as string);

    if (isNaN(productId)) {
      return new Response(
        JSON.stringify({ error: 'ID de producto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar que el producto existe
    const existingProduct = await Database.getProductById(productId);

    if (!existingProduct) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Eliminar el producto (las relaciones se eliminan automáticamente por CASCADE)
    await Database.deleteProduct(productId);

    return new Response(
      JSON.stringify({ message: 'Producto eliminado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar producto:', error);
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

// GET - Obtener producto por ID
export const GET: APIRoute = async (context) => {
  try {
    // Obtener ID del producto
    const productId = parseInt(context.params.id as string);

    if (isNaN(productId)) {
      return new Response(
        JSON.stringify({ error: 'ID de producto inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener el producto
    const product = await Database.getProductById(productId);

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
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

import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

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

// POST - Crear nuevo producto
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

    // Validaciones básicas
    if (!name || !slug || !description) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: name, slug, description',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear el producto
    const newProduct = await Database.createProduct({
      name,
      slug,
      description,
      price: price ? parseFloat(price) : 0,
      stock: stock ? parseInt(stock) : 0,
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
      retailPrice: retailPrice ? parseFloat(retailPrice) : 0,
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : 0,
      discount: discount ? parseFloat(discount) : 0,
      discountType: discountType || 'percentage',
      images: images || [],
      categories: categories || [],
      relatedProducts: relatedProducts || []
    });

    return new Response(JSON.stringify(newProduct), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al crear producto:', error);

    // Manejar errores de constraint (slug duplicado)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un producto con ese slug' }),
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

import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';

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

    // Obtener productos con sus relaciones
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        retailPrice: true,
        wholesalePrice: true,
        discount: true,
        discountType: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        // Descomenta estas líneas cuando implementes las relaciones en tu esquema Prisma
        // categories: {
        //   select: {
        //     category: {
        //       select: {
        //         id: true,
        //         name: true,
        //         slug: true
        //       }
        //     }
        //   }
        // },
        // images: {
        //   select: {
        //     image: {
        //       select: {
        //         id: true,
        //         url: true,
        //         alt: true
        //       }
        //     }
        //   }
        // }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatear productos
    const formattedProducts = products.map((product: any) => ({
      ...product,
      images: null, // Temporal hasta implementar relaciones
      categories: null, // Temporal hasta implementar relaciones
      relatedProducts: [], // Temporal hasta implementar relaciones

      // Cuando implementes las relaciones, podrías usar algo como:
      // images: product.images?.map(pi => pi.image) || [],
      // categories: product.categories?.map(pc => pc.category) || [],
    }));

    return new Response(JSON.stringify(formattedProducts), {
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
  } finally {
    // Cerrar la conexión de Prisma
    await prisma.$disconnect();
  }
};

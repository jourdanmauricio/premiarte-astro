import { ProductService } from '@/lib/services/products';
import { verifyAdminAuth } from '@/lib/utils';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación de administrador
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener datos del body
    const body = await context.request.json();
    const { productIds, operation, percentage } = body;

    // Validaciones
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Se requiere un array de IDs de productos',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!operation || !['add', 'subtract'].includes(operation)) {
      return new Response(
        JSON.stringify({
          error: 'La operación debe ser "Incrementar" o "Decrementar"',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return new Response(
        JSON.stringify({
          error: 'El porcentaje debe ser un número entre 0 y 100',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Actualizar precios
    const result = await ProductService.updatePricesBulk({
      productIds,
      operation,
      percentage,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar precios:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

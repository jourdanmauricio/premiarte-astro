import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';
import * as XLSX from 'xlsx';

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

    // Obtener el archivo del FormData
    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó ningún archivo' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Leer el archivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El archivo Excel está vacío' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Procesar los datos
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y la primera fila son encabezados

      try {
        // Validar campos requeridos
        if (!row.SKU || !row.Nombre || !row.Descripción) {
          results.errors++;
          const missingFields = [];
          if (!row.SKU) missingFields.push('SKU');
          if (!row.Nombre) missingFields.push('Nombre');
          if (!row.Descripción) missingFields.push('Descripción');
          results.errorDetails.push(
            `Fila ${rowNumber}: Campos obligatorios faltantes: ${missingFields.join(', ')}`
          );
          continue;
        }

        // Preparar datos del producto
        const productData = {
          sku: row.SKU.toString().trim(),
          name: row.Nombre.toString().trim(),
          description: row.Descripción.toString().trim(),
          price: row.Precio ? parseFloat(row.Precio) : 0,
          stock: row.Stock ? parseInt(row.Stock) : 0,
          retailPrice: row.Precio_Retail ? parseFloat(row.Precio_Retail) : 0,
          wholesalePrice: row.Precio_Mayorista ? parseFloat(row.Precio_Mayorista) : 0,
          slug: row.Slug ? row.Slug.toString().trim() : row.Nombre.toString().toLowerCase().replace(/\s+/g, '-'),
          isActive: row.Activo === 'Sí' || row.Activo === 'Si' || row.Activo === 'S' || row.Activo === true,
          isFeatured: row.Destacado === 'Sí' || row.Destacado === 'Si' || row.Destacado === 'S' || row.Destacado === true,
        };

        // Verificar si el producto existe por SKU
        const existingProduct = await Database.getProductBySku(productData.sku);

        if (existingProduct) {
          // Actualizar producto existente
          await Database.updateProduct(existingProduct.id, {
            ...productData,
            priceUpdatedAt: new Date().toISOString(), // Actualizar fecha de actualización de precio
          });
          results.updated++;
        } else {
          // Crear nuevo producto
          await Database.createProduct({
            ...productData,
            priceUpdatedAt: new Date().toISOString(), // Establecer fecha de actualización de precio
          });
          results.created++;
        }
      } catch (error) {
        results.errors++;
        results.errorDetails.push(
          `Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al procesar archivo Excel:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

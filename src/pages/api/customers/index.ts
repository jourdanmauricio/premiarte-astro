import { Database } from '@/lib/db';
import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

export const GET: APIRoute = async (context) => {
  try {
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }
    const customersData = await Database.getAllCustomers();

    const customers = customersData.sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''))
    );
    return new Response(JSON.stringify(customers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST - Crear nueva cliente
export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener datos del body
    const body = await context.request.json();
    const { name, email, phone, type, document, address, observation } = body;

    // Validaciones básicas
    if (!name || !email || !phone || !type) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: name, email, phone, type',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear la cliente
    const newCustomer = await Database.createCustomer({
      name,
      email,
      phone,
      type,
      document,
      address,
      observation,
    });

    return new Response(JSON.stringify(newCustomer), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al crear cliente:', error);

    // Manejar errores de constraint (email duplicado)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return new Response(
        JSON.stringify({ error: 'Ya existe una cliente con ese email' }),
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

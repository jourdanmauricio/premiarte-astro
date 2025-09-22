import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clerkClient } from '@clerk/astro/server';
import type { APIContext } from 'astro';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para verificar autenticación y rol de admin
// Función para verificar autenticación y rol de admin
export async function verifyAdminAuth(
  context: APIContext
): Promise<
  | { success: false; response: Response }
  | { success: true; userId: string; user: any }
> {
  // Verificar autenticación
  const { userId } = context.locals.auth();

  if (!userId) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    };
  }

  // Verificar que el usuario sea admin
  try {
    const user = await clerkClient(context).users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return {
        success: false,
        response: new Response(
          JSON.stringify({
            error: 'Acceso denegado. Se requieren permisos de administrador.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ),
      };
    }

    return {
      success: true,
      userId,
      user,
    };
  } catch (error) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: 'Error al verificar permisos' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ),
    };
  }
}

// Función para crear respuestas de error estandarizadas
export function createErrorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Función para crear respuestas de éxito estandarizadas
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Función para generar un slug a partir de un string
export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Reemplazar caracteres especiales del español
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ü/g, 'u')
      // Reemplazar espacios y caracteres especiales con guiones
      .replace(/[^a-z0-9]+/g, '-')
      // Eliminar guiones al inicio y al final
      .replace(/^-+|-+$/g, '')
      // Reemplazar múltiples guiones consecutivos con uno solo
      .replace(/-+/g, '-')
  );
}

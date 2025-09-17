import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';
import { v2 as cloudinary } from 'cloudinary';
import { Database } from '@/lib/db';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  folder: import.meta.env.CLOUDINARY_FOLDER,
});

// GET - Obtener todas las imágenes
export const GET: APIRoute = async (context) => {
  try {
    // GET público - no requiere autenticación para mostrar imágenes en el sitio

    const images = await Database.getAllImages();

    console.log(`GET /api/media - Returning ${images.length} images`);

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener las imágenes' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// POST - Subir nueva imagen
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
    const { url, alt, tag, observation } = body;

    // Validar campos requeridos
    if (!url || !alt) {
      return new Response(
        JSON.stringify({ error: 'URL y alt son campos requeridos' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Crear la imagen en la base de datos
    const newImage = await Database.createImage({
      url,
      alt,
      tag,
      observation,
    });

    console.log('POST /api/media - Image created:', newImage);

    return new Response(JSON.stringify(newImage), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear imagen:', error);
    return new Response(JSON.stringify({ error: 'Error al crear la imagen' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { Database } from '@/lib/db';
import { clerkClient } from '@clerk/astro/server';
import { verifyAdminAuth } from '@/lib/utils';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  folder: import.meta.env.CLOUDINARY_FOLDER,
});

// DELETE - Eliminar imagen
export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const id = parseInt(context.params.id as string);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Obtener la imagen de la base de datos
    const image = await Database.getImageById(id);

    if (!image) {
      return new Response(JSON.stringify({ error: 'Imagen no encontrada' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Extraer el public_id de la URL de Cloudinary
    const urlParts = String(image.url).split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `Premiarte/${fileName.split('.')[0]}`;

    // Eliminar de Cloudinary PRIMERO
    const cloudinaryResult = await cloudinary.uploader.destroy(publicId);

    // Verificar que la eliminación de Cloudinary fue exitosa
    if (
      cloudinaryResult.result !== 'ok' &&
      cloudinaryResult.result !== 'not found'
    ) {
      return new Response(
        JSON.stringify({
          error: 'Error al eliminar la imagen de Cloudinary',
          details: cloudinaryResult,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Solo si Cloudinary se eliminó exitosamente, eliminar de la base de datos
    await Database.deleteImage(id);

    return new Response(
      JSON.stringify({ message: 'Imagen eliminada correctamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar la imagen' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// PUT - Actualizar imagen
export const PUT: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    const id = parseInt(context.params.id as string);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar que la imagen existe
    const existingImage = await Database.getImageById(id);
    if (!existingImage) {
      return new Response(JSON.stringify({ error: 'Imagen no encontrada' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const body = await context.request.json();
    const { tag, alt, observation } = body;

    // Actualizar en la base de datos
    const updatedImage = await Database.updateImage(id, {
      tag,
      alt,
      observation,
    });

    return new Response(JSON.stringify(updatedImage), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar imagen:', error);

    return new Response(
      JSON.stringify({ error: 'Error al actualizar la imagen' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

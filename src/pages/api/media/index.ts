import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/astro/server';

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

    const images = await prisma.image.findMany({
      orderBy: {
        createdAt: 'desc', // Opcional: ordenar por fecha de creación
      },
    });

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

    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó ningún archivo' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'Premiarte',
      resource_type: 'auto',
    });

    // Guardar en la base de datos
    const alt = formData.get('alt') as string;
    const tag = formData.get('tag') as string;
    const observation = formData.get('observation') as string;

    console.log('formData fields:', { alt, tag, observation });

    const newImage = await prisma.image.create({
      data: {
        url: uploadResult.secure_url,
        alt: alt || file.name.split('.')[0], // Usar nombre del archivo como fallback
        tag: tag || null,
        observation: observation || null,
      },
    });

    return new Response(JSON.stringify(newImage), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return new Response(JSON.stringify({ error: 'Error al subir la imagen' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

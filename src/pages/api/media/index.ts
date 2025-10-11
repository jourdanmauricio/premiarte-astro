import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { Database } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/utils';

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
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Obtener datos del FormData
    const formData = await context.request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const tag = formData.get('tag') as string;
    const observation = formData.get('observation') as string;
    const public_id = formData.get('public_id') as string;

    // Validar campos requeridos
    if (!file || !alt) {
      return new Response(
        JSON.stringify({ error: 'Archivo y alt son campos requeridos' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Subir a Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            folder: 'premiarte',
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            public_id: public_id,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const cloudinaryResult = uploadResult as any;

    // Crear la imagen en la base de datos
    const newImage = await Database.createImage({
      url: cloudinaryResult.secure_url,
      alt,
      tag: tag || '',
      observation: observation || '',
    });

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

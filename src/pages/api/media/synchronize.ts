import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { db, Images, eq } from 'astro:db';
import { clerkClient } from '@clerk/astro/server';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

// POST - Sincronizar imágenes de Cloudinary
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

    // Obtener carpeta desde variable de entorno
    const cloudinaryFolder = import.meta.env.CLOUDINARY_FOLDER || 'Premiarte';

    // Obtener todas las imágenes de Cloudinary en la carpeta específica
    const cloudinaryImages = await cloudinary.search
      .expression(`folder:${cloudinaryFolder} AND resource_type:image`)
      .sort_by('created_at', 'desc')
      .max_results(500) // Ajusta según necesites
      .execute();

    // Obtener todas las imágenes existentes en la base de datos
    const existingImages = await db.select().from(Images);

    // Crear un Set de public_ids existentes para búsqueda rápida
    const existingPublicIds = new Set(
      existingImages.map((img) => {
        // Extraer public_id de la URL
        const urlParts = img.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        return `${cloudinaryFolder}/${fileName.split('.')[0]}`;
      })
    );

    let added = 0;
    let skipped = 0;
    const newImages = [];

    // Procesar imágenes de Cloudinary
    for (const cloudinaryImg of cloudinaryImages.resources) {
      if (!existingPublicIds.has(cloudinaryImg.public_id)) {
        // Imagen no existe en BD, agregarla
        const [newImage] = await db
          .insert(Images)
          .values({
            url: cloudinaryImg.secure_url,
            alt: cloudinaryImg.public_id, // Usar public_id como alt temporal
            tag: null,
            observation: null,
          })
          .returning();

        newImages.push(newImage);
        added++;
      } else {
        skipped++;
      }
    }

    // Marcar imágenes que están en BD pero no en Cloudinary
    const cloudinaryPublicIds = new Set(
      cloudinaryImages.resources.map((img: any) => img.public_id)
    );

    let marked = 0;
    for (const existingImg of existingImages) {
      const urlParts = existingImg.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `${cloudinaryFolder}/${fileName.split('.')[0]}`;

      if (
        !cloudinaryPublicIds.has(publicId) &&
        existingImg.observation !== 'Eliminar'
      ) {
        await db
          .update(Images)
          .set({ observation: 'Eliminar' })
          .where(eq(Images.id, existingImg.id));
        marked++;
      }
    }

    const summary = {
      success: true,
      cloudinaryTotal: cloudinaryImages.resources.length,
      added,
      skipped,
      marked,
      newImages: newImages.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al sincronizar imágenes:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al sincronizar las imágenes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

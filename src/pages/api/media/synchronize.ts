import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { Database } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/utils';

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
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
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
    const existingImages = await Database.getAllImages();

    // Crear un Set de public_ids existentes para búsqueda rápida
    const existingPublicIds = new Set(
      existingImages.map((img: any) => {
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
        try {
          // Crear nuevo registro en la base de datos
          const newImage = await Database.createImage({
            url: cloudinaryImg.secure_url,
            alt:
              cloudinaryImg.display_name ||
              cloudinaryImg.public_id.split('/').pop() ||
              'Imagen',
            tag: '',
            observation: `Sincronizado desde Cloudinary - ${new Date().toISOString()}`,
          });

          newImages.push(newImage);
          added++;
          console.log(`Agregada imagen: ${cloudinaryImg.public_id}`);
        } catch (error) {
          console.error(
            `Error al agregar imagen ${cloudinaryImg.public_id}:`,
            error
          );
        }
      } else {
        skipped++;
        console.log(`Imagen ya existe, omitiendo: ${cloudinaryImg.public_id}`);
      }
    }

    console.log(`Sincronización completada:
      - Total en Cloudinary: ${cloudinaryImages.resources.length}
      - Agregadas: ${added}
      - Omitidas: ${skipped}
      - Total en BD: ${existingImages.length + added}`);

    return new Response(
      JSON.stringify({
        message: 'Sincronización completada exitosamente',
        stats: {
          cloudinaryTotal: cloudinaryImages.resources.length,
          added,
          skipped,
          totalInDatabase: existingImages.length + added,
        },
        newImages,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en la sincronización:', error);
    return new Response(
      JSON.stringify({ error: 'Error en la sincronización con Cloudinary' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

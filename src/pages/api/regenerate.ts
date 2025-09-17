import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const { userId } = context.locals.auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🔄 Iniciando regeneración del sitio via Coolify...');

    // Configuración de Coolify
    const coolifyApiUrl =
      process.env.COOLIFY_API_URL || 'http://localhost:8000';
    const coolifyApiToken = process.env.COOLIFY_API_TOKEN;
    const coolifyApplicationId = process.env.COOLIFY_APPLICATION_ID;

    if (!coolifyApiToken || !coolifyApplicationId) {
      console.log('📝 Variables de Coolify no configuradas completamente...');
      return new Response(
        JSON.stringify({
          success: true,
          message:
            'Regeneración solicitada (configurar COOLIFY_API_TOKEN y COOLIFY_APPLICATION_ID para auto-deploy)',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      console.log(`🔄 Triggering deploy en Coolify: ${coolifyApiUrl}`);

      // Llamar a la API de Coolify para triggear deploy
      const deployResponse = await fetch(
        `${coolifyApiUrl}/api/v1/applications/${coolifyApplicationId}/deploy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${coolifyApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            force_rebuild: true,
            comment: 'Regeneración desde dashboard admin',
          }),
        }
      );

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        throw new Error(
          `Error en API de Coolify (${deployResponse.status}): ${errorText}`
        );
      }

      const deployData = await deployResponse.json();
      console.log('✅ Deploy iniciado en Coolify:', deployData);

      return new Response(
        JSON.stringify({
          success: true,
          message:
            'Regeneración iniciada en Coolify. El sitio se actualizará en unos minutos.',
          deploymentId: deployData.deployment_uuid || deployData.id,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      console.error('❌ Error al triggear deploy en Coolify:', error);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al comunicarse con Coolify',
          details: error.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('❌ Error en regeneración:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

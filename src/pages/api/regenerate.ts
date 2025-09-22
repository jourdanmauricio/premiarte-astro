import type { APIRoute } from 'astro';
import { verifyAdminAuth } from '@/lib/utils';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await verifyAdminAuth(context);
    if (!authResult.success) {
      return authResult.response;
    }

    // Configuración de Coolify
    const coolifyApiUrl =
      process.env.COOLIFY_API_URL || 'http://localhost:8000';
    const coolifyApiToken = process.env.COOLIFY_API_TOKEN;
    const coolifyApplicationId = process.env.COOLIFY_APPLICATION_ID;

    if (!coolifyApiToken || !coolifyApplicationId) {
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
      // Llamar a la API de Coolify v4 para triggear deploy
      const deployResponse = await fetch(`${coolifyApiUrl}/api/v1/deploy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${coolifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: coolifyApplicationId,
        }),
      });

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        throw new Error(
          `Error en API de Coolify (${deployResponse.status}): ${errorText}`
        );
      }

      const deployData = await deployResponse.json();

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
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

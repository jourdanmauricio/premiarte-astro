class RegenerateService {
  private baseUrl = '/api/regenerate';

  /**
   * Solicita la regeneración completa del sitio via Coolify
   */
  async regenerateSite(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    deploymentId?: string;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al regenerar el sitio');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en regeneración:', error);
      throw error;
    }
  }
}

export const regenerateService = new RegenerateService();

import type { Image } from '@/shared/types';

interface SyncResult {
  success: boolean;
  cloudinaryTotal: number;
  added: number;
  skipped: number;
  marked: number;
  newImages: Array<{
    id: number;
    url: string;
    alt: string;
  }>;
}

class MediaService {
  private baseUrl = '/api/media';

  // Obtener todas las imágenes
  async getImages(): Promise<Image[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener las imágenes');
    }
    return response.json();
  }

  // Subir nueva imagen
  async uploadImage(
    file: File,
    additionalData?: {
      alt?: string;
      tag?: string;
      observation?: string;
      public_id?: string;
    }
  ): Promise<Image> {
    const formData = new FormData();
    formData.append('file', file);

    // Agregar campos adicionales si se proporcionan
    if (additionalData?.alt) {
      formData.append('alt', additionalData.alt);
    }
    if (additionalData?.tag) {
      formData.append('tag', additionalData.tag);
    }
    if (additionalData?.observation) {
      formData.append('observation', additionalData.observation);
    }
    if (additionalData?.public_id) {
      formData.append('public_id', additionalData.public_id);
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir la imagen');
    }
    return response.json();
  }

  // Actualizar imagen
  async updateImage(id: number, imageData: Partial<Image>): Promise<Image> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar la imagen');
    }
    return response.json();
  }

  // Eliminar imagen
  async deleteImage(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al eliminar la imagen con ID ${id}`
      );
    }
  }

  // Sincronizar imágenes de Cloudinary
  async synchronizeImages(): Promise<SyncResult> {
    const response = await fetch(`${this.baseUrl}/synchronize`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al sincronizar las imágenes');
    }
    return response.json();
  }
}

// Exportar una instancia singleton del servicio
export const mediaService = new MediaService();

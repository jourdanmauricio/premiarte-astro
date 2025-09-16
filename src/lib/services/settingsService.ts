import type {
  Settings,
  CreateSettingsData,
  UpdateSettingsData,
} from '@/shared/types';

class SettingsService {
  private baseUrl = '/api/settings';

  // Obtener todas las categorías
  async getSettings(): Promise<Settings[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los settings');
    }
    return response.json();
  }

  // Obtener una categoría por ID
  async getSettingById(id: number): Promise<Settings> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el setting con ID ${id}`);
    }
    return response.json();
  }

  // Crear una nueva categoría
  async createSetting(settingData: CreateSettingsData): Promise<Settings> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la configuración');
    }
    return response.json();
  }

  // Eliminar una categoría
  async deleteSetting(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar la configuración con ID ${id}`);
    }
  }

  async updateSetting(
    section: string,
    settingData: { value: any }
  ): Promise<Settings> {
    const response = await fetch(`${this.baseUrl}/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || 'Error al actualizar la configuración de home'
      );
    }
    return response.json();
  }
}

// Exportar una instancia singleton del servicio
export const settingsService = new SettingsService();

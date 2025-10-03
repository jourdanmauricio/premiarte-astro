import type {
  CreateResponsibleData,
  Responsible,
  UpdateResponsibleData,
  ResponsibleWithBudgetCount,
} from '@/shared/types';

class ResponsiblesService {
  private baseUrl = '/api/responsibles';

  // Obtener todos los responsables
  async getResponsibles(): Promise<Responsible[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los responsables');
    }
    return response.json();
  }

  // Obtener un responsable por ID
  async getResponsibleById(id: number): Promise<Responsible> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el responsable con ID ${id}`);
    }
    return response.json();
  }

  // Crear un nuevo responsable
  async createResponsible(
    responsibleData: CreateResponsibleData
  ): Promise<Responsible> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el responsable');
    }
    return response.json();
  }

  // Actualizar un responsable existente
  async updateResponsible(
    id: number,
    responsibleData: UpdateResponsibleData
  ): Promise<Responsible> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al actualizar el responsable con ID ${id}`
      );
    }
    return response.json();
  }

  // Eliminar un responsable
  async deleteResponsible(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al eliminar el responsable con ID ${id}`
      );
    }
  }

  // Obtener responsables con conteo de presupuestos
  async getResponsiblesWithBudgetCount(): Promise<
    ResponsibleWithBudgetCount[]
  > {
    const response = await fetch(`${this.baseUrl}/with-budget-count`);
    if (!response.ok) {
      throw new Error(
        'Error al obtener los responsables con conteo de presupuestos'
      );
    }
    return response.json();
  }
}

// Exportar una instancia singleton del servicio
export const responsiblesService = new ResponsiblesService();

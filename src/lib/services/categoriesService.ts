import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/shared/types';

class CategoriesService {
  private baseUrl = '/api/categories';

  // Obtener todas las categorías
  async getCategories(): Promise<Category[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener las categorías');
    }
    return response.json();
  }

  // Obtener una categoría por ID
  async getCategoryById(id: number): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener la categoría con ID ${id}`);
    }
    return response.json();
  }

  // Crear una nueva categoría
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la categoría');
    }
    return response.json();
  }

  // Actualizar una categoría existente
  async updateCategory(
    id: number,
    categoryData: UpdateCategoryData
  ): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al actualizar la categoría con ID ${id}`
      );
    }
    return response.json();
  }

  // Eliminar una categoría
  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar la categoría con ID ${id}`);
    }
  }
}

// Exportar una instancia singleton del servicio
export const categoriesService = new CategoriesService();

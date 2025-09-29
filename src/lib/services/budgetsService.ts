import type {
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
} from '@/shared/types';

class BudgetsService {
  private baseUrl = '/api/budgets';

  // Obtener todos los productos
  async getBudgets(): Promise<Budget[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener el presupuesto');
    }
    return response.json();
  }

  // Obtener un presupuesto por ID
  async getBudgetById(id: number): Promise<Budget> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el presupuesto con ID ${id}`);
    }
    return response.json();
  }

  // Eliminar un newsletter
  async deleteBudget(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el presupuesto con ID ${id}`);
    }
  }

  async createBudget(budgetData: CreateBudgetData): Promise<Budget> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error('Error al crear el presupuesto');
    }
    return response.json();
  }

  async updateBudget(
    id: number,
    budgetData: UpdateBudgetData
  ): Promise<Budget> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el presupuesto con ID ${id}`);
    }
    return response.json();
  }
}

export const budgetsService = new BudgetsService();

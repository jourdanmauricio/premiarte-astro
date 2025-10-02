import type {
  CreateCustomerData,
  Customer,
  UpdateCustomerData,
} from '@/shared/types';

class CustomersService {
  private baseUrl = '/api/customers';

  // Obtener todos los clientes
  async getCustomers(): Promise<Customer[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los clientes');
    }
    return response.json();
  }

  // Obtener un cliente por ID
  async getCustomerById(id: number): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el cliente con ID ${id}`);
    }
    return response.json();
  }

  // Crear un nuevo cliente
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el cliente');
    }
    return response.json();
  }

  // Actualizar un cliente existente
  async updateCustomer(
    id: number,
    customerData: UpdateCustomerData
  ): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al actualizar el cliente con ID ${id}`
      );
    }
    return response.json();
  }

  // Eliminar un cliente
  async deleteCustomer(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el cliente con ID ${id}`);
    }
  }
}

// Exportar una instancia singleton del servicio
export const customersService = new CustomersService();

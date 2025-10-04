import type {
  Order,
  CreateOrderData,
  UpdateOrderData,
  OrderWithItems,
} from '@/shared/types';

class OrdersService {
  private baseUrl = '/api/orders';

  // Obtener todos los productos
  async getOrders(): Promise<Order[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los pedidos');
    }
    return response.json();
  }

  // Obtener un pedido por ID
  async getOrderById(id: number): Promise<OrderWithItems> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el pedido con ID ${id}`);
    }
    return response.json();
  }

  // Eliminar un pedido
  async deleteOrder(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el pedido con ID ${id}`);
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Error al crear el pedido');
    }
    return response.json();
  }

  async updateOrder(id: number, orderData: UpdateOrderData): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el pedido con ID ${id}`);
    }
    return response.json();
  }
}

export const ordersService = new OrdersService();

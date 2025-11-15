import type {
  Product,
  ProductResume,
  CreateProductData,
  UpdateProductData,
} from '@/shared/types';

class ProductsService {
  private baseUrl = '/api/products';

  // Obtener todos los productos
  async getProducts(): Promise<Product[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los productos');
    }
    return response.json();
  }

  async getResumeProducts(): Promise<ProductResume[]> {
    const response = await fetch(`${this.baseUrl}/resume`);
    if (!response.ok) {
      throw new Error('Error al obtener los productos');
    }
    return response.json();
  }

  // Obtener un producto por ID
  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el producto con ID ${id}`);
    }
    return response.json();
  }

  // Crear un nuevo producto
  async createProduct(productData: CreateProductData): Promise<Product> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Error al crear el producto');
    }
    return response.json();
  }

  // Actualizar un producto existente
  async updateProduct(
    id: number,
    productData: UpdateProductData
  ): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el producto con ID ${id}`);
    }
    return response.json();
  }

  // Eliminar un producto
  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el producto con ID ${id}`);
    }
  }

  async updatePricesBulk(
    productIds: number[],
    percentage: number,
    operation: 'add' | 'subtract'
  ) {
    const response = await fetch(`${this.baseUrl}/update-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds, percentage, operation }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar los precios');
    }
    return response.json();
  }
}

// Exportar una instancia singleton del servicio
export const productsService = new ProductsService();

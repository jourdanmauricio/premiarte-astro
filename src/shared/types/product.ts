// Tipo para los productos
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: {
    id: number;
    url: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

// Tipo para crear un nuevo producto (sin id)
export interface CreateProductData {
  name: string;
  price: number;
  description: string;
  image?: number;
  category?: number;
}

// Tipo para actualizar un producto
export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
  image?: number;
  category?: number;
}

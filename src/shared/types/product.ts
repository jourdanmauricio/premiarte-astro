// Tipo para los productos
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  retailPrice: number;
  wholesalePrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  slug: string;
  relatedProducts: {
    id: number;
    name: string;
    slug: string;
  }[];
  images:
    | {
        id: number;
        url: string;
        alt: string;
      }[]
    | null;
  categories:
    | {
        id: number;
        name: string;
        slug: string;
      }[]
    | null;
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

import type { Category } from '@/shared/types/category';
import type { Image } from '@/shared/types/image';

// Tipo para los productos
export interface Product {
  id: number;
  name: string;
  slug: string;
  price?: number;
  sku?: string;
  description: string;
  stock?: number;
  isActive: boolean;
  isFeatured: boolean;
  retailPrice?: number | undefined;
  wholesalePrice?: number | undefined;
  discount?: number | undefined;
  discountType: 'percentage' | 'fixed';
  priceUpdatedAt?: string;
  relatedProducts: number[] | null;
  images: number[] | null;
  categories: Category[] | null;
}

export interface ProductWithDetails extends Product {
  detCategories: Category[];
  detImages: Image[];
}

export interface ProductWithCategoriesAndImages
  extends Omit<Product, 'images' | 'categories'> {
  images: Image[];
  categories: Category[];
}

// Opción 1: Extender de Product omitiendo campos que se generan automáticamente
export interface CreateProductData
  extends Omit<Product, 'id' | 'slug' | 'categories'> {
  // El slug se puede generar automáticamente del nombre
  // El id se genera automáticamente por la base de datos
  categories: (number | undefined)[] | null;
}

// Tipo para actualizar un producto
export interface UpdateProductData
  extends Omit<Product, 'id' | 'slug' | 'categories'> {
  // El slug se puede generar automáticamente del nombre
  // El id se genera automáticamente por la base de datos
  categories: (number | undefined)[] | null;
}

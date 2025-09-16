// Tipo para las categorías
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: {
    id: number;
    url: string;
  } | null;
  featured: boolean;
}

// Tipo para crear una nueva categoría (sin id)
export interface CreateCategoryData {
  name: string;
  slug: string;
  description: string;
  imageId: number;
  featured?: boolean;
}

// Tipo para actualizar una categoría
export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  imageId?: number;
  featured?: boolean;
}

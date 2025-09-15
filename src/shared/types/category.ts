// Tipo para las categorías
export interface Category {
  id: number;
  name: string;
  description: string;
  image: {
    id: number;
    url: string;
  } | null;
}

// Tipo para crear una nueva categoría (sin id)
export interface CreateCategoryData {
  name: string;
  description: string;
  image?: number;
  featured?: boolean;
}

// Tipo para actualizar una categoría
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: number;
  featured?: boolean;
}

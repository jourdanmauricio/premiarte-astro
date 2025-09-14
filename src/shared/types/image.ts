// Tipo para las imágenes
export interface Image {
  id: number;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipo para crear una nueva imagen
export interface CreateImageData {
  url: string;
}

// Tipo para actualizar una imagen
export interface UpdateImageData {
  url?: string;
}

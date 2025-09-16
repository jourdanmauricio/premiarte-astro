# ImageSelector

Componente reutilizable para seleccionar y subir imágenes a Cloudinary.

## Características

- **Dos pestañas**: Seleccionar imágenes existentes o subir nuevas
- **Navegación por carpetas**: Organización por tags (Categorías, Productos, Páginas, Otros)
- **Selección múltiple**: Configurable para seleccionar una o varias imágenes
- **Drag & Drop**: Subida de archivos por arrastrar y soltar
- **Preview**: Vista previa de imágenes antes de subir
- **Validación**: Solo acepta archivos de imagen
- **Responsive**: Adaptado para diferentes tamaños de pantalla

## Uso Básico

```tsx
import { useState } from 'react';
import { ImageSelector } from '@/components/dashboard/image-selector';
import type { Image } from '@/shared/types';

function MyComponent() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  const handleImageSelection = (images: Image[]) => {
    setSelectedImages(images);
    // Procesar las imágenes seleccionadas
  };

  return (
    <>
      <button onClick={() => setSelectorOpen(true)}>
        Seleccionar Imágenes
      </button>

      <ImageSelector
        open={selectorOpen}
        closeModal={() => setSelectorOpen(false)}
        onSelect={handleImageSelection}
        multipleSelect={true} // false para selección única
        selectedImages={selectedImages}
      />
    </>
  );
}
```

## Props

### ImageSelector

| Prop             | Tipo                        | Descripción                       | Default |
| ---------------- | --------------------------- | --------------------------------- | ------- |
| `open`           | `boolean`                   | Controla si el modal está abierto | -       |
| `closeModal`     | `() => void`                | Función para cerrar el modal      | -       |
| `onSelect`       | `(images: Image[]) => void` | Callback al seleccionar imágenes  | -       |
| `multipleSelect` | `boolean`                   | Permite selección múltiple        | `false` |
| `selectedImages` | `Image[]`                   | Imágenes preseleccionadas         | `[]`    |

## Estructura de Carpetas

El componente organiza las imágenes en las siguientes carpetas según su `tag`:

- **Todas**: Muestra todas las imágenes
- **Categorías**: Imágenes con tag "Categorías"
- **Productos**: Imágenes con tag "Productos"
- **Páginas**: Imágenes con tag "Páginas"
- **Otros**: Imágenes sin tag o con tag "Otros"

## Funcionalidades

### Tab Seleccionar

- Vista de carpetas con conteo de imágenes
- Navegación por doble clic en carpetas
- Grilla de imágenes con checkbox para selección
- Soporte para selección múltiple o única
- Preview de imagen seleccionada

### Tab Subir

- Drag & drop de archivos
- Selector de archivos manual
- Preview antes de subir
- Campos de metadatos:
  - Alt text (requerido)
  - Carpeta/tag
  - Observaciones (opcional)
- Validación de tipos de archivo
- Auto-redirección a tab de selección tras subir

## Integración con Formularios

El componente se integra fácilmente con formularios existentes:

```tsx
// En CategorieModal.tsx
const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

const handleImageSelection = (selectedImages: Image[]) => {
  if (selectedImages.length > 0) {
    form.setValue('imageId', selectedImages[0].id);
  }
  setImageSelectorOpen(false);
};

const selectedImage = images?.find((img) => img.id === form.watch('imageId'));
```

## Dependencias

- `@tanstack/react-query` - Para gestión de estado del servidor
- `react-hook-form` - Para formularios (en componente de subida)
- `zod` - Para validación de esquemas
- `sonner` - Para notificaciones toast
- Componentes UI: `Dialog`, `Tabs`, `Button`, `Checkbox`, etc.

## Servicios Requeridos

- `mediaService.getImages()` - Obtener lista de imágenes
- `mediaService.uploadImage()` - Subir nueva imagen
- Query invalidation para actualizar cache tras subidas

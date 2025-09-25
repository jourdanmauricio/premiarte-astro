import { useState, useMemo } from 'react';

import type { Image } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { imageTagsList } from '@/shared/consts';
import { Checkbox } from '@/components/ui/checkbox';
import { getFolderIcon } from '@/shared/functions';

interface ImageSelectProps {
  images: Image[];
  selectedImages: Image[];
  onImageSelect: (image: Image) => void;
  multipleSelect: boolean;
  defaultTag?: string;
}

export const ImageSelect = ({
  images,
  selectedImages,
  onImageSelect,
  multipleSelect,
  defaultTag = 'Otros',
}: ImageSelectProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Agrupar imágenes por carpeta y contar
  const folderData = useMemo(() => {
    const folders = imageTagsList.map((folder) => {
      const count =
        folder.id === 'Todas'
          ? images.length
          : images.filter(
              (img) =>
                img.tag === folder.id || (!img.tag && folder.id === defaultTag)
            ).length;

      return {
        ...folder,
        count,
      };
    });
    return folders;
  }, [images]);

  // Filtrar imágenes según la carpeta seleccionada
  const filteredImages = useMemo(() => {
    if (!selectedFolder || selectedFolder === 'Todas') {
      return images;
    }

    if (selectedFolder === 'Otros') {
      return images.filter((img) => !img.tag || img.tag === defaultTag);
    }

    return images.filter((img) => img.tag === selectedFolder);
  }, [images, selectedFolder]);

  const handleFolderDoubleClick = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  const isImageSelected = (image: Image) => {
    return selectedImages.some((selected) => selected.id === image.id);
  };

  // const getFolderIcon = (folderId: string) => {
  //   const icons: Record<string, string> = {
  //     Todas: '📁',
  //     Categorías: '📂',
  //     Productos: '📦',
  //     Páginas: '📄',
  //     Otros: '🗂️',
  //   };
  //   return icons[folderId] || '📁';
  // };

  if (!selectedFolder) {
    // Vista de carpetas
    return (
      <div className='h-full'>
        <h3 className='text-lg font-medium mb-4'>Selecciona una carpeta</h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {folderData.map((folder) => (
            <div
              key={folder.id}
              className='
                flex flex-col items-center p-4 border rounded-lg cursor-pointer
                hover:bg-gray-50 hover:border-gray-300 transition-colors
              '
              onDoubleClick={() => handleFolderDoubleClick(folder.id)}
            >
              <div className='text-4xl mb-2'>{getFolderIcon(folder.id)}</div>
              <div className='text-center'>
                <p className='font-medium text-sm text-gray-900'>
                  {folder.description}
                </p>
                <p className='text-xs text-gray-500'>
                  {folder.count} imagen{folder.count !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className='text-sm text-gray-500 mt-4 text-center'>
          Haz doble clic en una carpeta para ver sus imágenes
        </p>
      </div>
    );
  }

  // Vista de imágenes
  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between mb-4 flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleBackToFolders}>
            ← Volver a carpetas
          </Button>
          <h3 className='text-lg font-medium'>
            {folderData.find((f) => f.id === selectedFolder)?.description}
          </h3>
          <span className='text-sm text-gray-500'>
            ({filteredImages.length} imagen
            {filteredImages.length !== 1 ? 'es' : ''})
          </span>
        </div>
      </div>

      <div className='flex-1 overflow-auto'>
        {filteredImages.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl text-gray-300 mb-4'>🖼️</div>
            <p className='text-gray-500'>No hay imágenes en esta carpeta</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4'>
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`
                    relative group border rounded-lg overflow-hidden cursor-pointer
                    transition-all duration-200
                    ${
                      isImageSelected(image)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onDoubleClick={() => onImageSelect(image)}
                >
                  {/* Checkbox */}
                  <div className='absolute top-2 left-2 z-10'>
                    <Checkbox
                      checked={isImageSelected(image)}
                      onCheckedChange={() => onImageSelect(image)}
                      className='bg-white'
                    />
                  </div>

                  {/* Imagen */}
                  <div className='aspect-square bg-gray-100'>
                    <img
                      src={image.url}
                      alt={image.alt}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                    />
                  </div>

                  {/* Información */}
                  <div className='p-2 bg-white'>
                    <p className='text-xs font-medium text-gray-900 truncate'>
                      {image.alt}
                    </p>
                    {image.tag && (
                      <p className='text-xs text-gray-500'>{image.tag}</p>
                    )}
                  </div>

                  {/* Overlay cuando está seleccionada */}
                  {isImageSelected(image) && (
                    <div className='absolute inset-0 bg-blue-500/10 bg-opacity-10 pointer-events-none' />
                  )}
                </div>
              ))}
            </div>

            {filteredImages.length > 0 && (
              <div className='mt-4 text-sm text-gray-500 text-center'>
                {multipleSelect
                  ? 'Haz clic en el checkbox o doble clic en las imágenes para seleccionarlas'
                  : 'Haz clic en el checkbox o doble clic en una imagen para seleccionarla'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

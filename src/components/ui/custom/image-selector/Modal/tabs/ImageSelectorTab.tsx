import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Image } from '@/shared/types';

interface ImageSelectorTabProps {
  tempSelected: Image[];
  canSelectMore: () => boolean;
  selectedImageIds: number[];
  maxImages: number;
  selectedFolder: string | null;
  folderData: { id: string; description: string; count: number }[];
  setSelectedFolder: (folderId: string | null) => void;
  getFolderIcon: (folderId: string) => React.ReactNode;
  filteredImages: Image[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  setTempSelected: (images: Image[]) => void;
}

const ImageSelectorTab = ({
  tempSelected,
  canSelectMore,
  selectedImageIds,
  maxImages,
  selectedFolder,
  folderData,
  setSelectedFolder,
  getFolderIcon,
  filteredImages,
  searchTerm,
  setSearchTerm,
  setTempSelected,
}: ImageSelectorTabProps) => {
  const isImageSelected = (image: Image) => {
    return (
      selectedImageIds.includes(image.id) ||
      tempSelected.some((temp) => temp.id === image.id)
    );
  };

  const handleImageClick = (image: Image) => {
    const isAlreadySelected = selectedImageIds.includes(image.id);

    if (isAlreadySelected) return;

    if (isImageSelected(image)) {
      // Remover de selección temporal
      setTempSelected(tempSelected.filter((img) => img.id !== image.id));
    } else if (canSelectMore()) {
      // Agregar a selección temporal
      setTempSelected([...tempSelected, image]);
    }
  };
  return (
    <>
      {/* Contador de selección */}
      <div className='flex items-center justify-between mb-4'>
        <Badge variant='outline'>
          {tempSelected.length} nuevas imágenes seleccionadas
        </Badge>
        <Badge variant={canSelectMore() ? 'default' : 'destructive'}>
          {selectedImageIds.length + tempSelected.length}/{maxImages} imágenes
        </Badge>
      </div>

      {!selectedFolder ? (
        // Vista de carpetas
        <div className='flex-1 overflow-auto'>
          <h3 className='text-lg font-medium mb-4'>Selecciona una carpeta</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {folderData.map((folder) => (
              <div
                key={folder.id}
                className='flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors'
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className='text-4xl mb-2'>{getFolderIcon(folder.id)}</div>
                <div className='text-center'>
                  <p className='font-medium text-sm text-gray-900'>
                    {folder.description}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {folder.count} imagen
                    {folder.count !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className='text-sm text-gray-500 mt-4 text-center'>
            Haz clic en una carpeta para ver sus imágenes
          </p>
        </div>
      ) : (
        // Vista de imágenes
        <div className='flex-1 flex flex-col min-h-0'>
          {/* Header con navegación y búsqueda */}
          <div className='flex items-center justify-between mb-4 flex-shrink-0'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedFolder(null)}
              >
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

          {/* Barra de búsqueda */}
          <div className='relative mb-4 flex-shrink-0'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Buscar por nombre o etiqueta...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Grid de imágenes */}
          <div className='flex-1 overflow-y-auto overflow-x-hidden'>
            {filteredImages.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-6xl text-gray-300 mb-4'>🖼️</div>
                <p className='text-gray-500'>
                  {searchTerm
                    ? 'No se encontraron imágenes'
                    : 'No hay imágenes en esta carpeta'}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4 pr-2'>
                {filteredImages.map((image) => {
                  const isSelected = isImageSelected(image);
                  const isAlreadySelected = selectedImageIds.includes(image.id);
                  const isTempSelected = tempSelected.some(
                    (temp) => temp.id === image.id
                  );

                  return (
                    <div
                      key={image.id}
                      className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? isAlreadySelected
                            ? 'border-green-500 ring-2 ring-green-200'
                            : 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!canSelectMore() && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() =>
                        !isAlreadySelected && handleImageClick(image)
                      }
                    >
                      {/* Checkbox */}
                      <div className='absolute top-2 left-2 z-10'>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            !isAlreadySelected && handleImageClick(image)
                          }
                          className='bg-white'
                          disabled={isAlreadySelected}
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
                      {isSelected && (
                        <div
                          className={`absolute inset-0 ${
                            isAlreadySelected ? 'bg-green-500' : 'bg-blue-500'
                          } bg-opacity-10 pointer-events-none`}
                        />
                      )}

                      {/* Badge de estado */}
                      {isAlreadySelected && (
                        <Badge className='absolute top-2 right-2 bg-green-500 text-white'>
                          Ya seleccionada
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSelectorTab;

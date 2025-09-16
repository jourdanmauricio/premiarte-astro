import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/lib/services/mediaService';
import { toast } from 'sonner';
import type { Image } from '@/shared/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { ImageSelect } from '@/components/dashboard/image-selector/ImageSelect';
import { ImageUpload } from '@/components/dashboard/image-selector/ImageUpload';

export const imageTagsList = [
  { id: 'Todas', description: 'Todas' },
  { id: 'Categorías', description: 'Categorías' },
  { id: 'Productos', description: 'Productos' },
  { id: 'Páginas', description: 'Páginas' },
  { id: 'Otros', description: 'Otros' },
];

interface ImageSelectorProps {
  open: boolean;
  closeModal: () => void;
  onSelect: (images: Image[]) => void;
  multipleSelect?: boolean;
  selectedImages?: Image[];
}

export const ImageSelector = ({
  open,
  closeModal,
  onSelect,
  multipleSelect = false,
  selectedImages = [],
}: ImageSelectorProps) => {
  const [activeTab, setActiveTab] = useState('select');
  const [internalSelectedImages, setInternalSelectedImages] =
    useState<Image[]>(selectedImages);
  const [uploadState, setUploadState] = useState<{
    canSubmit: boolean;
    isLoading: boolean;
    submit: () => void;
  }>({
    canSubmit: false,
    isLoading: false,
    submit: () => {},
  });
  const queryClient = useQueryClient();

  // Obtener todas las imágenes
  const { data: images } = useQuery<Image[]>({
    queryKey: ['Images'],
    queryFn: () => mediaService.getImages(),
    enabled: open,
  });

  // Resetear selección cuando se abre el modal
  useEffect(() => {
    if (open) {
      setInternalSelectedImages(selectedImages);
      setActiveTab('select');
    }
  }, [open, selectedImages]);

  const handleImageSelection = (image: Image) => {
    if (multipleSelect) {
      setInternalSelectedImages((prev) => {
        const isSelected = prev.some((img) => img.id === image.id);
        if (isSelected) {
          return prev.filter((img) => img.id !== image.id);
        } else {
          return [...prev, image];
        }
      });
    } else {
      const isSelected = internalSelectedImages.some(
        (img) => img.id === image.id
      );
      setInternalSelectedImages(isSelected ? [] : [image]);
    }
  };

  const handleUploadSuccess = (newImage: Image) => {
    // Invalidar queries para actualizar la lista
    queryClient.invalidateQueries({ queryKey: ['Images'] });
    // Cambiar a la tab de selección y seleccionar la nueva imagen
    setActiveTab('select');
    setInternalSelectedImages([newImage]);
    toast.success('Imagen subida correctamente');
  };

  const handleAccept = () => {
    onSelect(internalSelectedImages);
    closeModal();
  };

  const handleCancel = () => {
    setInternalSelectedImages(selectedImages);
    closeModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className='max-h-[95vh] max-w-6xl w-full flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='dialog-title'>
            Selector de Imágenes
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 flex flex-col min-h-0 overflow-x-auto'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex flex-col h-full'
          >
            <TabsList className='grid w-full grid-cols-2 flex-shrink-0'>
              <TabsTrigger value='select'>Seleccionar</TabsTrigger>
              <TabsTrigger value='upload'>Subir</TabsTrigger>
            </TabsList>

            <TabsContent value='select' className='flex-1 mt-4 overflow-hidden'>
              <ImageSelect
                images={images || []}
                selectedImages={internalSelectedImages}
                onImageSelect={handleImageSelection}
                multipleSelect={multipleSelect}
              />
            </TabsContent>

            <TabsContent value='upload' className='flex-1 mt-4 overflow-auto'>
              <ImageUpload
                onUploadSuccess={handleUploadSuccess}
                onStateChange={setUploadState}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Botones condicionales según la tab activa */}
        {activeTab === 'select' && (
          <div className='flex justify-end gap-4 pt-4 border-t flex-shrink-0'>
            <Button
              type='button'
              onClick={handleCancel}
              variant='outline'
              className='min-w-[120px]'
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAccept}
              className='min-w-[120px]'
              disabled={internalSelectedImages.length === 0}
            >
              Aceptar ({internalSelectedImages.length})
            </Button>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className='flex justify-end gap-4 pt-4 border-t flex-shrink-0'>
            <Button
              type='button'
              onClick={handleCancel}
              variant='outline'
              className='min-w-[120px]'
            >
              Cancelar
            </Button>
            <Button
              onClick={uploadState.submit}
              className='min-w-[120px]'
              disabled={!uploadState.canSubmit || uploadState.isLoading}
            >
              {uploadState.isLoading ? 'Subiendo...' : 'Subir imagen'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

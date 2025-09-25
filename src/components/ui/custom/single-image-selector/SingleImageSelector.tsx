import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';

import type { Image } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { mediaService } from '@/lib/services/mediaService';
import { ImageSelector } from '@/components/ui/custom/single-image-selector/image-selector';

interface ImageSelectorProps {
  form: UseFormReturn<any>;
  defaultTag?: string;
}

const SingleImageSelector = ({ form, defaultTag }: ImageSelectorProps) => {
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const { data: images } = useQuery<Image[]>({
    queryKey: ['Images'],
    queryFn: () => mediaService.getImages(),
  });

  const selectedImage = images?.find((img) => img.id === form.watch('imageId'));

  const handleImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('imageId', selectedImages[0].id, { shouldDirty: true });
    }
    setImageSelectorOpen(false);
  };

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium'>Imagen</label>
      <div className='flex items-center gap-4'>
        {selectedImage ? (
          <div className='flex items-center gap-4'>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className='w-16 h-16 object-cover rounded-md border'
            />
            <div>
              <p className='text-sm font-medium'>{selectedImage.alt}</p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setImageSelectorOpen(true)}
              >
                Cambiar imagen
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type='button'
            variant='outline'
            onClick={() => setImageSelectorOpen(true)}
          >
            Seleccionar imagen
          </Button>
        )}
      </div>

      <ImageSelector
        open={imageSelectorOpen}
        closeModal={() => setImageSelectorOpen(false)}
        onSelect={handleImageSelection}
        multipleSelect={false}
        selectedImages={selectedImage ? [selectedImage] : []}
        defaultTag={defaultTag}
      />
    </div>
  );
};

export { SingleImageSelector };

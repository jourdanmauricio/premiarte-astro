import type z from 'zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import type { Image } from '@/shared/types';
import type { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { ImageSelector } from '@/components/dashboard/image-selector';

interface HeroPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
  images: Image[];
}

const HeroPanel = ({ form, images }: HeroPanelProps) => {
  const [logoImageSelectorOpen, setLogoImageSelectorOpen] = useState(false);
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const selectedLogoImage = images?.find(
    (img) => img.id === form.watch('home.hero.logoId')
  );

  const selectedImage = images?.find(
    (img) => img.id === form.watch('home.hero.imageId')
  );

  const handleLogoImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('home.hero.logoId', selectedImages[0].id, {
        shouldDirty: true,
      });
    }
    setLogoImageSelectorOpen(false);
  };

  const handleImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('home.hero.imageId', selectedImages[0].id, {
        shouldDirty: true,
      });
    }
    setImageSelectorOpen(false);
  };

  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Hero</h2>
      <div className='grid grid-cols-2 gap-4 p-8'>
        <div className='space-y-2 w-full'>
          <label className='text-sm font-medium'>Logo Imagen</label>
          <div className='flex items-center gap-4'>
            {selectedLogoImage ? (
              <div className='flex items-center gap-4'>
                <img
                  src={selectedLogoImage.url}
                  alt={selectedLogoImage.alt}
                  className='w-16 h-16 object-cover rounded-md border'
                />
                <div>
                  <p className='text-sm font-medium'>{selectedLogoImage.alt}</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setLogoImageSelectorOpen(true)}
                  >
                    Cambiar imagen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type='button'
                variant='outline'
                onClick={() => setLogoImageSelectorOpen(true)}
              >
                Seleccionar imagen
              </Button>
            )}
          </div>
        </div>
        <div className='space-y-2 w-full'>
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
        </div>
        <div className='w-full'>
          <InputField label='Título' name='home.hero.title' form={form} />
        </div>
        <div className='w-full'>
          <InputField label='Texto' name='home.hero.text' form={form} />
        </div>
        <div className='w-full'>
          <InputField
            label='Texto del botón'
            name='home.hero.buttonText'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Link del botón'
            name='home.hero.buttonLink'
            form={form}
          />
        </div>
      </div>

      {logoImageSelectorOpen && (
        <ImageSelector
          open={logoImageSelectorOpen}
          closeModal={() => setLogoImageSelectorOpen(false)}
          onSelect={handleLogoImageSelection}
          multipleSelect={false}
          selectedImages={selectedLogoImage ? [selectedLogoImage] : []}
        />
      )}

      {imageSelectorOpen && (
        <ImageSelector
          open={imageSelectorOpen}
          closeModal={() => setImageSelectorOpen(false)}
          onSelect={handleImageSelection}
          multipleSelect={false}
          selectedImages={selectedImage ? [selectedImage] : []}
        />
      )}
    </>
  );
};

export default HeroPanel;

import { z } from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import InputField from '@/components/ui/custom/input-field';
import SubmitButton from '@/components/ui/custom/submit-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import type { SettingsFormSchema } from '@/shared/schemas';
import type { Image } from '@/shared/types';
import { ImageSelector } from '@/components/ui/custom/single-image-selector/image-selector/ImageSelector';

interface SocialLinkModalProps {
  open: boolean;
  closeModal: () => void;
  socialLink: MainFormData['home']['footer']['socialLinks'][0] | null;
  socialLinkIndex: number | null;
  form: UseFormReturn<MainFormData>;
  images: Image[];
}

const SocialLinkFormSchema = z.object({
  href: z.string().min(1, { message: 'Enlace requerido' }),
  label: z.string().min(1, { message: 'Etiqueta requerida' }),
  image: z.number().min(1, { message: 'Imagen requerida' }),
});

type SocialLinkFormData = z.infer<typeof SocialLinkFormSchema>;
type MainFormData = z.infer<typeof SettingsFormSchema>;

const defaultValues: SocialLinkFormData = {
  href: '',
  label: '',
  image: 0,
};

const SocialLinkModal = ({
  open,
  closeModal,
  socialLink,
  socialLinkIndex,
  form: mainForm,
  images,
}: SocialLinkModalProps) => {
  const mode = socialLink ? 'EDIT' : 'CREATE';
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const socialLinkForm = useForm<SocialLinkFormData>({
    resolver: zodResolver(SocialLinkFormSchema),
    defaultValues: socialLink || defaultValues,
  });

  const selectedImageId = socialLinkForm.watch('image');
  const selectedImage = images.find((img) => img.id === selectedImageId);

  const handleSelectImage = (imageId: number) => {
    socialLinkForm.setValue('image', imageId, { shouldValidate: true });
    setImageSelectorOpen(false);
  };

  const onSubmit = (data: SocialLinkFormData) => {
    const currentSocialLinks = [
      ...(mainForm.getValues('home.footer.socialLinks') || []),
    ];

    if (mode === 'EDIT' && socialLinkIndex !== null) {
      // Editar servicio existente
      currentSocialLinks[socialLinkIndex] = data;
    } else {
      // Agregar nuevo servicio
      currentSocialLinks.push(data);
    }

    mainForm.setValue('home.footer.socialLinks', currentSocialLinks, {
      shouldDirty: true,
    });

    socialLinkForm.reset();
    closeModal();
  };

  const onError = () => {
    console.log('Errores de validación:', socialLinkForm.formState.errors);
  };

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'CREATE' ? 'Agregar Red Social' : 'Editar Red Social'}
          </DialogTitle>
        </DialogHeader>

        <Form {...socialLinkForm}>
          <form
            // onSubmit={slideForm.handleSubmit(onSubmit, onError)}
            className='space-y-6'
          >
            {/* Título */}
            <InputField
              form={socialLinkForm}
              name='name'
              label='Nombre'
              placeholder='Ingresa el nombre'
            />

            {/* Enlace */}
            <InputField
              form={socialLinkForm}
              name='href'
              label='Enlace'
              placeholder='Ingresa el enlace'
            />

            {/* Etiqueta */}
            <InputField
              form={socialLinkForm}
              name='label'
              label='Etiqueta'
              placeholder='Ingresa la etiqueta'
            />

            {/* Imagen */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Imagen de la red social
              </label>
              <div className='flex items-center gap-4'>
                {selectedImage ? (
                  <div className='flex items-center gap-3'>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.alt}
                      className='w-16 h-16 object-cover rounded-md border'
                    />
                    <div>
                      <p className='text-sm font-medium'>{selectedImage.alt}</p>
                      <p className='text-xs text-gray-500'>
                        ID: {selectedImage.id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center'>
                    <span className='text-xs text-gray-400'>Sin imagen</span>
                  </div>
                )}
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setImageSelectorOpen(true)}
                >
                  {selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </Button>
              </div>
              {socialLinkForm.formState.errors.image && (
                <p className='text-sm text-red-600'>
                  {socialLinkForm.formState.errors.image.message}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={closeModal}>
                Cancelar
              </Button>
              <SubmitButton
                label={mode === 'CREATE' ? 'Crear slide' : 'Guardar cambios'}
                className='min-w-[120px]'
                type='button'
                onClick={socialLinkForm.handleSubmit(onSubmit, onError)}
                showSpinner={socialLinkForm.formState.isSubmitting}
                disabled={socialLinkForm.formState.isSubmitting}
              />
            </div>
          </form>
        </Form>
        {/* Selector de imágenes */}
        <ImageSelector
          open={imageSelectorOpen}
          closeModal={() => setImageSelectorOpen(false)}
          onSelect={(selectedImages) => {
            if (selectedImages.length > 0) {
              handleSelectImage(selectedImages[0].id);
            }
          }}
          multipleSelect={false}
          selectedImages={selectedImage ? [selectedImage] : []}
        />
      </DialogContent>
    </Dialog>
  );
};

export { SocialLinkModal };

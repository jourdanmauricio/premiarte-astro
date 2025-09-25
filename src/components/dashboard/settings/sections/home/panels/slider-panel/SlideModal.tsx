import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Image } from '@/shared/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageSelector } from '@/components/ui/custom/single-image-selector/image-selector';

// Schema específico para el slide
const SlideFormSchema = z.object({
  image: z.number().min(1, { message: 'Imagen requerida' }),
  title: z.string().min(1, { message: 'Título requerido' }),
  text: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  recommended: z.boolean(),
});

type SlideFormData = z.infer<typeof SlideFormSchema>;
type MainFormData = z.infer<typeof SettingsFormSchema>;

interface SlideModalProps {
  open: boolean;
  closeModal: () => void;
  slide: MainFormData['home']['slider'][0] | null;
  slideIndex: number | null;
  images: Image[];
  form: UseFormReturn<MainFormData>;
}

const defaultValues: SlideFormData = {
  image: 0,
  title: '',
  text: '',
  buttonText: '',
  buttonLink: '',
  recommended: false,
};

const SlideModal = ({
  open,
  closeModal,
  slide,
  slideIndex,
  images,
  form: mainForm,
}: SlideModalProps) => {
  const mode = slide ? 'EDIT' : 'CREATE';
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const slideForm = useForm<SlideFormData>({
    resolver: zodResolver(SlideFormSchema),
    defaultValues: slide || defaultValues,
  });

  const selectedImageId = slideForm.watch('image');
  const selectedImage = images.find((img) => img.id === selectedImageId);

  const handleSelectImage = (imageId: number) => {
    slideForm.setValue('image', imageId, { shouldValidate: true });
    setImageSelectorOpen(false);
  };

  const onSubmit = (data: SlideFormData) => {
    const currentSlides = [...(mainForm.getValues('home.slider') || [])];

    if (mode === 'EDIT' && slideIndex !== null) {
      // Editar slide existente
      currentSlides[slideIndex] = data;
    } else {
      // Agregar nuevo slide
      currentSlides.push(data);
    }

    mainForm.setValue('home.slider', currentSlides, { shouldDirty: true });
    closeModal();
  };

  const onError = () => {
    console.log('Errores de validación:', slideForm.formState.errors);
  };

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'CREATE' ? 'Agregar Slide' : 'Editar Slide'}
          </DialogTitle>
        </DialogHeader>

        <Form {...slideForm}>
          <form
            // onSubmit={slideForm.handleSubmit(onSubmit, onError)}
            className='space-y-6'
          >
            {/* Imagen */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Imagen del slide</label>
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
              {slideForm.formState.errors.image && (
                <p className='text-sm text-red-600'>
                  {slideForm.formState.errors.image.message}
                </p>
              )}
            </div>

            {/* Título */}
            <InputField
              form={slideForm}
              name='title'
              label='Título del slide'
              placeholder='Ingresa el título principal'
            />

            {/* Texto */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Texto del slide (opcional)
              </label>
              <textarea
                {...slideForm.register('text')}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Descripción o texto adicional del slide'
              />
            </div>

            {/* Botón */}
            <div className='grid grid-cols-2 gap-4'>
              <InputField
                form={slideForm}
                name='buttonText'
                label='Texto del botón'
                placeholder='Ej: Ver más, Comprar ahora'
              />
              <InputField
                form={slideForm}
                name='buttonLink'
                label='Enlace del botón'
                placeholder='https://ejemplo.com'
              />
            </div>

            {/* Recomendado */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='recommended'
                checked={slideForm.watch('recommended')}
                onCheckedChange={(checked) =>
                  slideForm.setValue('recommended', !!checked)
                }
              />
              <label htmlFor='recommended' className='text-sm font-medium'>
                Marcar como recomendado
              </label>
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
                onClick={slideForm.handleSubmit(onSubmit, onError)}
                showSpinner={slideForm.formState.isSubmitting}
                disabled={slideForm.formState.isSubmitting}
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

export { SlideModal };

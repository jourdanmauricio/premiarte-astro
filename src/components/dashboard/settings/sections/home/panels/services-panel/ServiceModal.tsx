import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import TextareaField from '@/components/ui/custom/textarea-field';
import { ImageSelector } from '@/components/dashboard/image-selector';
import type { Image } from '@/shared/types';

// Schema específico para el servicio
const ServiceFormSchema = z.object({
  title: z.string().min(1, { message: 'Nombre requerido' }),
  description: z.string().min(1, { message: 'Descripción requerida' }),
  image: z.number().min(1, { message: 'Imagen requerida' }),
});

type ServiceFormData = z.infer<typeof ServiceFormSchema>;
type MainFormData = z.infer<typeof SettingsFormSchema>;

interface ServiceModalProps {
  open: boolean;
  closeModal: () => void;
  service: MainFormData['home']['services']['services'][0] | null;
  serviceIndex: number | null;
  form: UseFormReturn<MainFormData>;
  images: Image[];
}

const defaultValues: ServiceFormData = {
  title: '',
  description: '',
  image: 0,
};

const ServiceModal = ({
  open,
  closeModal,
  service,
  serviceIndex,
  form: mainForm,
  images,
}: ServiceModalProps) => {
  const mode = service ? 'EDIT' : 'CREATE';
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: service || defaultValues,
  });

  const selectedImageId = serviceForm.watch('image');
  const selectedImage = images.find((img) => img.id === selectedImageId);

  const handleSelectImage = (imageId: number) => {
    serviceForm.setValue('image', imageId, { shouldValidate: true });
    setImageSelectorOpen(false);
  };

  const onSubmit = (data: ServiceFormData) => {
    const currentServices = [
      ...(mainForm.getValues('home.services.services') || []),
    ];

    if (mode === 'EDIT' && serviceIndex !== null) {
      // Editar servicio existente
      currentServices[serviceIndex] = data;
    } else {
      // Agregar nuevo servicio
      currentServices.push(data);
    }

    mainForm.setValue('home.services.services', currentServices, {
      shouldDirty: true,
    });
    closeModal();
  };

  const onError = () => {
    console.log('Errores de validación:', serviceForm.formState.errors);
  };

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'CREATE' ? 'Agregar Servicio' : 'Editar Servicio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...serviceForm}>
          <form
            // onSubmit={serviceForm.handleSubmit(onSubmit, onError)}
            className='space-y-6'
          >
            {/* Título */}
            <InputField
              form={serviceForm}
              name='title'
              label='Título'
              placeholder='Ingresa el título'
            />

            {/* Descripción */}
            <TextareaField
              form={serviceForm}
              name='description'
              label='Descripción'
              placeholder='Ingresa la descripción'
            />

            {/* Imagen */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Imagen del servicio</label>
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
              {serviceForm.formState.errors.image && (
                <p className='text-sm text-red-600'>
                  {serviceForm.formState.errors.image.message}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={closeModal}>
                Cancelar
              </Button>
              <SubmitButton
                label={mode === 'CREATE' ? 'Crear servicio' : 'Guardar cambios'}
                className='min-w-[120px]'
                type='button'
                onClick={serviceForm.handleSubmit(onSubmit, onError)}
                showSpinner={serviceForm.formState.isSubmitting}
                disabled={serviceForm.formState.isSubmitting}
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

export { ServiceModal };

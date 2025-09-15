import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/lib/services/mediaService';
import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Image } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { ImageFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import Dropdown from '@/components/ui/custom/dropdown';
import { imageTagsList } from '@/shared/consts';

interface ImageModalProps {
  open: boolean;
  closeModal: () => void;
  image: Image | null;
}

const defaultValues = {
  url: '',
  tag: '',
  alt: '',
  observation: '',
};

const ImageModal = ({ open, closeModal, image }: ImageModalProps) => {
  const mode = image ? 'EDIT' : 'CREATE';
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const form = useForm<z.infer<typeof ImageFormSchema>>({
    resolver: zodResolver(ImageFormSchema),
    defaultValues:
      mode === 'EDIT'
        ? {
            url: image?.url,
            tag: image?.tag ?? '',
            alt: image?.alt ?? '',
            observation: image?.observation ?? '',
          }
        : defaultValues,
  });

  // Mutation para crear o actualizar imagen
  const imageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ImageFormSchema>) => {
      if (mode === 'EDIT' && image?.id) {
        return mediaService.updateImage(image.id, {
          tag: data.tag,
          alt: data.alt,
          observation: data.observation,
        });
      } else if (mode === 'CREATE' && selectedFile) {
        return mediaService.uploadImage(selectedFile, {
          alt: data.alt,
          tag: data.tag,
          observation: data.observation,
        });
      } else {
        throw new Error('No se ha seleccionado ningún archivo para subir');
      }
    },
    onSuccess: (result) => {
      // Invalidar y refetch del query de imágenes
      queryClient.invalidateQueries({ queryKey: ['Images'] });

      if (mode === 'CREATE') {
        toast.success('Imagen subida correctamente');
      } else {
        toast.success('Imagen actualizada correctamente');
      }

      closeModal();
      form.reset();
      setSelectedFile(null);
      setPreviewUrl('');
    },
    onError: (error) => {
      console.error('Error al guardar imagen:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar la imagen'
      );
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Actualizar form con datos del archivo
      form.setValue('url', file.name);
      form.setValue('alt', file.name.split('.')[0]);
    }
  };

  const onSubmit = (data: z.infer<typeof ImageFormSchema>) => {
    console.log('data', data);
    imageMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-h-[95%] max-w-4xl overflow-y-auto w-full'>
        <DialogHeader>
          <DialogTitle className='dialog-title'>
            {mode === 'CREATE' ? 'Nueva imagen' : 'Editar imagen'}
          </DialogTitle>
          <DialogDescription />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
              <div className='mt-4 flex flex-col gap-6 w-full'>
                {mode === 'EDIT' ? (
                  <img
                    src={image?.url}
                    alt={image?.alt}
                    className='w-full h-full object-contain border border-gray-200 max-h-90'
                  />
                ) : (
                  <div className='w-full'>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt='Vista previa'
                        className='w-full h-full object-contain border border-gray-200 max-h-90'
                      />
                    ) : (
                      <div className='w-full h-52 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center'>
                        <div className='text-center'>
                          <p className='text-gray-500 mb-2'>
                            Selecciona una imagen
                          </p>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <InputField
                  label='URL'
                  name='url'
                  placeholder='URL'
                  form={form}
                  type='url'
                  readOnly
                />

                <Dropdown
                  list={imageTagsList}
                  label='Tag'
                  name='tag'
                  placeholder='Tag'
                  form={form}
                />

                <InputField
                  label='Texto alternativo *'
                  name='alt'
                  placeholder='Texto alternativo'
                  form={form}
                  maxLength={100}
                />

                <InputField
                  label='Observación'
                  name='observation'
                  placeholder='Observación'
                  form={form}
                  maxLength={100}
                />
              </div>

              <div className='flex justify-end gap-8 pt-10'>
                <Button
                  type='button'
                  onClick={closeModal}
                  variant='outline'
                  className='min-w-[150px]'
                >
                  Cancelar
                </Button>
                <SubmitButton
                  label={mode === 'CREATE' ? 'Subir imagen' : 'Guardar'}
                  className='min-w-[150px]'
                  showSpinner={imageMutation.isPending}
                  disabled={
                    imageMutation.isPending ||
                    (mode === 'CREATE'
                      ? !selectedFile
                      : !form.formState.isDirty)
                  }
                />
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { ImageModal };

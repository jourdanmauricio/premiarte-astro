import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/lib/services/categoriesService';
import { mediaService } from '@/lib/services/mediaService';
import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Category, Image } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { CategoryFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageSelector } from '@/components/dashboard/image-selector';

interface CategorieModalProps {
  open: boolean;
  closeModal: () => void;
  category: Category | null;
}

const defaultValues = {
  name: '',
  description: '',
  slug: '',
  imageId: 0,
  featured: false,
};

const CategorieModal = ({
  open,
  closeModal,
  category,
}: CategorieModalProps) => {
  const mode = category ? 'EDIT' : 'CREATE';
  const queryClient = useQueryClient();
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const { data: images } = useQuery<Image[]>({
    queryKey: ['Images'],
    queryFn: () => mediaService.getImages(),
  });

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues:
      mode === 'EDIT' && category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageId: category.image?.id,
            featured: category.featured,
          }
        : defaultValues,
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof CategoryFormSchema>) => {
      if (mode === 'EDIT' && category?.id) {
        return categoriesService.updateCategory(category.id, data);
      } else {
        return categoriesService.createCategory(data);
      }
    },
    onSuccess: async () => {
      // Invalidar y refrescar inmediatamente
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(
        mode === 'CREATE'
          ? 'Categoría creada correctamente'
          : 'Categoría actualizada correctamente'
      );
      closeModal();
      form.reset();
    },
    onError: (error) => {
      console.error('Error al guardar la categoría:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar la categoría'
      );
    },
  });

  const onSubmit = (data: z.infer<typeof CategoryFormSchema>) => {
    categoryMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  const handleImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('imageId', selectedImages[0].id, { shouldDirty: true });
    }
    setImageSelectorOpen(false);
  };

  const selectedImage = images?.find((img) => img.id === form.watch('imageId'));

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-h-[95%] max-w-2xl overflow-y-auto w-full'>
        <DialogHeader>
          <DialogTitle className='dialog-title'>
            {mode === 'CREATE' ? 'Nueva categoría' : 'Editar categoría'}
          </DialogTitle>
          <DialogDescription />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className='mt-4 flex flex-col gap-6 w-full'
            >
              <InputField
                label='Nombre'
                name='name'
                placeholder='Nombre de la categoría'
                form={form}
              />
              <InputField
                label='Slug'
                name='slug'
                placeholder='Slug'
                form={form}
              />
              <InputField
                label='Descripción'
                name='description'
                placeholder='Descripción'
                form={form}
              />
              {/* Selector de imagen */}
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
                        <p className='text-sm font-medium'>
                          {selectedImage.alt}
                        </p>
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

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='featured'
                  checked={form.watch('featured')}
                  onCheckedChange={(checked) => {
                    form.setValue('featured', !!checked, { shouldDirty: true });
                  }}
                />
                <label
                  htmlFor='featured'
                  className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Destacada
                </label>
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
                  label={mode === 'CREATE' ? 'Crear categoría' : 'Guardar'}
                  className='min-w-[150px]'
                  showSpinner={categoryMutation.isPending}
                  disabled={
                    categoryMutation.isPending || !form.formState.isDirty
                  }
                />
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>

      {/* Modal de selección de imágenes */}
      <ImageSelector
        open={imageSelectorOpen}
        closeModal={() => setImageSelectorOpen(false)}
        onSelect={handleImageSelection}
        multipleSelect={false}
        selectedImages={selectedImage ? [selectedImage] : []}
      />
    </Dialog>
  );
};

export { CategorieModal };

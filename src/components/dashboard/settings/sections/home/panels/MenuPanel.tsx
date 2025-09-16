import { mediaService } from '@/lib/services/mediaService';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Image, Settings } from '@/shared/types';
import { useForm } from 'react-hook-form';
import type z from 'zod';

import { SettingsFormSchema } from '@/shared/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsService } from '@/lib/services/settingsService';
import { ImageSelector } from '@/components/dashboard/image-selector';
import InputField from '@/components/ui/custom/input-field';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import SubmitButton from '@/components/ui/custom/submit-button';

const MenuPanel = () => {
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);
  const isInitialized = useRef(false);

  const queryClient = useQueryClient();

  const { data: images } = useQuery<Image[]>({
    queryKey: ['Images'],
    queryFn: () => mediaService.getImages(),
  });

  const { data: settingsData } = useQuery<Settings[]>({
    queryKey: ['Settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const form = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      home: {
        menu: {
          siteName: '',
          logoId: 0,
        },
        slider: [],
      },
    },
  });

  useEffect(() => {
    if (settingsData && !isInitialized.current) {
      const homeSetting = settingsData.find((s) => s.key === 'home');
      if (homeSetting) {
        try {
          const homeConfig = JSON.parse(homeSetting.value);
          form.reset({
            home: homeConfig,
          });
        } catch (error) {
          console.error('Error parsing home config:', error);
        }
      }
      isInitialized.current = true;
    }
  }, [settingsData]);

  const selectedImage = images?.find(
    (img) => img.id === form.watch('home.menu.logoId')
  );

  const handleImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('home.menu.logoId', selectedImages[0].id, {
        shouldDirty: true,
      });
    }
    setImageSelectorOpen(false);
  };

  const settingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof SettingsFormSchema>) => {
      console.log('🟡 Mutation started');
      const result = await settingsService.updateSetting('home', {
        value: data.home,
      });
      console.log('🟢 Mutation completed', result);
      // return result;
    },
    onSuccess: async () => {
      console.log('✅ Mutation success - BEFORE toast');
      toast.success('Configuración actualizada correctamente');
      console.log('✅ Mutation success - AFTER toast');

      // await queryClient.invalidateQueries({
      //   queryKey: ['Settings'],
      //   refetchType: 'none', // Evita el refetch automático
      // });
    },
    onError: (error) => {
      console.error('Error al actualizar la configuración:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al actualizar la configuración'
      );
    },
  });

  const onSubmit = (data: z.infer<typeof SettingsFormSchema>) => {
    console.log('data', data);
    settingsMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <div className='flex gap-12 items-center p-6'>
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
              <InputField
                label='Nombre del sitio'
                name='home.menu.siteName'
                form={form}
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline'>
              Cancelar
            </Button>
            <SubmitButton
              label='Guardar'
              className='min-w-[150px]'
              showSpinner={settingsMutation.isPending}
              disabled={settingsMutation.isPending || !form.formState.isDirty}
            />
          </div>
        </form>
      </Form>

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

export { MenuPanel };

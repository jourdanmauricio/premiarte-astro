import type z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SettingsFormSchema } from '@/shared/schemas';
import type { Image, Settings } from '@/shared/types';
import { mediaService } from '@/lib/services/mediaService';
import SubmitButton from '@/components/ui/custom/submit-button';
import { settingsService } from '@/lib/services/settingsService';
import { MenuPanel } from '@/components/dashboard/settings/sections/home/panels/menu-panel/MenuPanel';
import { SliderPanel } from '@/components/dashboard/settings/sections/home/panels/slider-panel/SliderPanel';
import { Separator } from '@/components/ui/separator';
import HeroPanel from '@/components/dashboard/settings/sections/home/panels/hero-panel/HeroPanel';
import { FeaturedProductsPanel } from '@/components/dashboard/settings/sections/home/panels/products-panel/FeatuedProductsPanel';
import TestimonialsPanel from '@/components/dashboard/settings/sections/home/panels/testimonials-panel/TestimonialsPanel';
import ServicesPanel from '@/components/dashboard/settings/sections/home/panels/services-panel/servicesPanel';
import { FeaturedCategoriesPanel } from '@/components/dashboard/settings/sections/home/panels/categories-panel/FeaturedCategoriesPanel';

const HomePanels = () => {
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
        hero: {
          logoId: 0,
          imageId: 0,
          title: '',
          text: '',
          buttonText: '',
          buttonLink: '',
        },
        featuredProducts: {
          title: '',
          text: '',
          buttonText: '',
          buttonLink: '',
        },
        services: {
          title: '',
          services: [],
        },
        testimonials: {
          title: '',
          testimonials: [],
        },
        featuredCategories: {
          title: '',
          text: '',
          buttonText: '',
          buttonLink: '',
        },
      },
    },
  });

  useEffect(() => {
    if (settingsData) {
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
    }
  }, [settingsData]);

  const settingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof SettingsFormSchema>) => {
      const result = await settingsService.updateSetting('home', {
        value: data.home,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['Settings'],
      });
      toast.success('Configuración actualizada correctamente');
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
    <div className='flex flex-col gap-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <MenuPanel form={form} images={images || []} />

          <Separator className='my-4' orientation='horizontal' />

          <SliderPanel form={form} images={images || []} />

          <Separator className='my-4' orientation='horizontal' />

          <HeroPanel form={form} images={images || []} />

          <Separator className='my-4' orientation='horizontal' />

          <FeaturedProductsPanel form={form} />

          <Separator className='my-4' orientation='horizontal' />

          <ServicesPanel form={form} images={images || []} />

          <Separator className='my-4' orientation='horizontal' />

          <FeaturedCategoriesPanel form={form} />

          <Separator className='my-4' orientation='horizontal' />

          <TestimonialsPanel form={form} />

          <div className='flex justify-end gap-2'>
            <Button type='button' className='min-w-[150px]' variant='outline'>
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
    </div>
  );
};

export { HomePanels };

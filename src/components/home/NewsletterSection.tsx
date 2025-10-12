'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { actions } from 'astro:actions';
import { toast } from 'sonner';
import { useState } from 'react';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/ui/custom/input-field';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SubmmitButton from '@/components/shared/SubmitButton';

const newsletterSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
});

const Newsletter = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof newsletterSchema>) => {
    setIsLoading(true);

    try {
      const result = await actions.subscribeToNewsletter(data);

      if (result.data?.success) {
        form.reset();
        toast.success('¡Suscripción exitosa!', {
          description: result.data.message,
        });
      } else {
        toast.error('Error al suscribirse', {
          description:
            result.data?.message || 'Ha ocurrido un error inesperado',
        });
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast.error('Error al suscribirse', {
        description:
          'Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='relative overflow-hidden py-24'>
      <div className='container relative z-10 px-4 md:px-6'>
        <div className='flex flex-col items-center space-y-8 text-center'>
          {/* Título mejorado */}
          <div className='space-y-4'>
            <h2 className='font-montserrat text-3xl font-semibold text-white md:text-4xl lg:text-5xl'>
              <span className='bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent'>
                Suscríbete
              </span>{' '}
              <span className='text-gray-200'>a nuestro boletín</span>
            </h2>
            <p className='max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl'>
              Suscríbete para recibir ofertas especiales, obsequios y consejos
              para tus agasajos.
            </p>
          </div>

          {/* Formulario mejorado */}
          <div className='w-full max-w-md'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-6'
                noValidate
              >
                <div className='space-y-4'>
                  <InputField
                    form={form}
                    label=''
                    name='name'
                    type='text'
                    placeholder='Ingresa tu nombre'
                    className='w-full rounded-lg px-4 py-4 text-lg text-white placeholder:text-gray-400'
                    maxLength={50}
                  />
                  <InputField
                    form={form}
                    label=''
                    type='email'
                    name='email'
                    placeholder='Ingresa tu email'
                    className='w-full rounded-lg px-4 py-4 text-lg text-white placeholder:text-gray-400'
                  />
                </div>

                {/* <Button
                  type='submit'
                  className='w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-orange-700 hover:shadow-2xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className='flex items-center gap-2'>
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                      Suscribiendo...
                    </div>
                  ) : (
                    'Suscríbete'
                  )}
                </Button> */}
                <SubmmitButton
                  label='Suscríbete'
                  showSpinner={isLoading}
                  disabled={isLoading}
                  className='px-8 py-6 text-lg font-semibold text-white min-w-40 w-full'
                />
              </form>
            </Form>
          </div>

          {/* Texto legal mejorado */}
          <p className='max-w-md text-sm leading-relaxed text-gray-400'>
            Al suscribirse, acepta nuestros{' '}
            <span className='cursor-pointer text-orange-400 transition-colors hover:text-orange-300'>
              Términos de servicio
            </span>{' '}
            y{' '}
            <span className='cursor-pointer text-orange-400 transition-colors hover:text-orange-300'>
              Política de privacidad
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

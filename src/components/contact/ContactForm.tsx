import type z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { actions } from 'astro:actions';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone } from 'lucide-react';
import { contactFormSchema } from '@/shared/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InputField from '@/components/ui/custom/input-field';
import TextareaField from '@/components/ui/custom/textarea-field';
import { Form } from '@/components/ui/form';

const ContactForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof contactFormSchema>) => {
    setIsLoading(true);

    try {
      const result = await actions.sendContactForm(data);

      if (result.data?.success) {
        form.reset();
        toast.success('Mensaje enviado exitosamente!', {
          description: 'Gracias por contactarnos',
        });
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        toast.error('Error enviando el mensaje', {
          description: 'Intentalo nuevamente',
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
      setIsSubmitted(true);
    }
  };

  return (
    <div className='grid gap-8 md:grid-cols-3'>
      <div className='md:col-span-2'>
        <Card>
          <CardContent className='p-6'>
            {isSubmitted ? (
              <div className='mb-6 rounded-lg bg-orange-500/10 p-4 text-orange-500'>
                <h3 className='mb-2 text-lg font-semibold'>
                  Gracias por contactarnos!
                </h3>
                <p>
                  Tu mensaje ha sido enviado exitosamente. Nos pondremos en
                  contacto contigo lo antes posible.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-12'
                  noValidate
                >
                  <div className='space-y-2'>
                    <InputField
                      id='name'
                      name='name'
                      label='Nombre y apellido*'
                      placeholder='Nombre'
                      form={form}
                    />
                  </div>

                  <div className='space-y-2'>
                    <InputField
                      id='email'
                      name='email'
                      label='Email*'
                      placeholder='mail@example.com'
                      form={form}
                    />
                  </div>

                  <div className='space-y-2'>
                    <InputField
                      id='phone'
                      name='phone'
                      label='Teléfono'
                      placeholder='(11) 9999-9999'
                      form={form}
                    />
                  </div>

                  <div className='space-y-2'>
                    <TextareaField
                      id='message'
                      form={form}
                      name='message'
                      label='Mensaje*'
                      placeholder='Cómo podemos ayudarte?'
                      required
                      rows={6}
                    />
                  </div>

                  <Button
                    type='submit'
                    className='ml-auto block w-full sm:w-auto hover:cursor-pointer bg-orange-500 hover:bg-orange-600'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando mensaje...' : 'Enviar mensaje'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className='p-6'>
            <h2 className='mb-12 text-xl font-semibold'>
              Información de contacto
            </h2>

            <div className='space-y-6'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500'>
                  <MapPin className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-medium'>Dirección</h3>
                  <address className='not-italic text-muted-foreground'>
                    123 Pet Street
                    <br />
                    Dogville, NY 10001
                    <br />
                    United States
                  </address>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500'>
                  <Phone className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-medium'>Teléfono</h3>
                  <p className='text-muted-foreground'>
                    <a
                      href='tel:+(221) 619-6520'
                      className='hover:text-orange-500'
                    >
                      (221) 619-6520
                    </a>
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500'>
                  <Mail className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-medium'>Email</h3>
                  <p className='text-muted-foreground'>
                    <a
                      href='mailto:info@premiarte.com.ar'
                      className='hover:text-orange-500'
                    >
                      info@premiarte.com.ar
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='mt-8'>
          <Card>
            <CardContent className='p-6'>
              <h2 className='mb-8 text-xl font-semibold'>
                Síguenos en nuestras redes sociales
              </h2>
              <div className='flex gap-4'>
                <a
                  href='#'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-colors hover:bg-orange-500 hover:text-orange-500-foreground'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-5 w-5'
                  >
                    <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'></path>
                  </svg>
                  <span className='sr-only'>Facebook</span>
                </a>
                <a
                  href='#'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-colors hover:bg-orange-500 hover:text-orange-500-foreground'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-5 w-5'
                  >
                    <rect
                      x='2'
                      y='2'
                      width='20'
                      height='20'
                      rx='5'
                      ry='5'
                    ></rect>
                    <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path>
                    <line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line>
                  </svg>
                  <span className='sr-only'>Instagram</span>
                </a>
                <a
                  href='#'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-colors hover:bg-orange-500 hover:text-orange-500-foreground'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-5 w-5'
                  >
                    <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z'></path>
                  </svg>
                  <span className='sr-only'>Twitter</span>
                </a>
                <a
                  href='#'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-colors hover:bg-orange-500 hover:text-orange-500-foreground'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-5 w-5'
                  >
                    <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z'></path>
                    <rect x='2' y='9' width='4' height='12'></rect>
                    <circle cx='4' cy='4' r='2'></circle>
                  </svg>
                  <span className='sr-only'>LinkedIn</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { ContactForm };

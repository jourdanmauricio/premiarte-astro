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

// Schema específico para el slide
const TestimonialFormSchema = z.object({
  name: z.string().min(1, { message: 'Nombre requerido' }),
  rating: z.string().min(1, { message: 'Puntuación requerida' }),
  description: z.string().min(1, { message: 'Descripción requerida' }),
});

type TestimonialFormData = z.infer<typeof TestimonialFormSchema>;
type MainFormData = z.infer<typeof SettingsFormSchema>;

interface TestimonialModalProps {
  open: boolean;
  closeModal: () => void;
  testimonial: MainFormData['home']['testimonials']['testimonials'][0] | null;
  testimonialIndex: number | null;
  form: UseFormReturn<MainFormData>;
}

const defaultValues: TestimonialFormData = {
  name: '',
  rating: '',
  description: '',
};

const TestimonialModal = ({
  open,
  closeModal,
  testimonial,
  testimonialIndex,
  form: mainForm,
}: TestimonialModalProps) => {
  const mode = testimonial ? 'EDIT' : 'CREATE';
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  const testimonialForm = useForm<TestimonialFormData>({
    resolver: zodResolver(TestimonialFormSchema),
    defaultValues: testimonial || defaultValues,
  });

  const onSubmit = (data: TestimonialFormData) => {
    const currentTestimonials = [
      ...(mainForm.getValues('home.testimonials.testimonials') || []),
    ];

    if (mode === 'EDIT' && testimonialIndex !== null) {
      // Editar slide existente
      currentTestimonials[testimonialIndex] = data;
    } else {
      // Agregar nuevo slide
      currentTestimonials.push(data);
    }

    mainForm.setValue('home.testimonials.testimonials', currentTestimonials, {
      shouldDirty: true,
    });
    closeModal();
  };

  const onError = () => {
    console.log('Errores de validación:', testimonialForm.formState.errors);
  };

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'CREATE' ? 'Agregar Slide' : 'Editar Slide'}
          </DialogTitle>
        </DialogHeader>

        <Form {...testimonialForm}>
          <form
            // onSubmit={slideForm.handleSubmit(onSubmit, onError)}
            className='space-y-6'
          >
            {/* Título */}
            <InputField
              form={testimonialForm}
              name='name'
              label='Nombre'
              placeholder='Ingresa el nombre'
            />

            {/* Puntuación */}
            <InputField
              form={testimonialForm}
              name='rating'
              label='Puntuación'
              placeholder='Ingresa la puntuación'
            />

            {/* Descripción */}
            <TextareaField
              form={testimonialForm}
              name='description'
              label='Descripción'
              placeholder='Ingresa la descripción'
            />

            {/* 
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Texto del slide (opcional)
              </label>
              <textarea
                {...testimonialForm.register('text')}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Descripción o texto adicional del slide'
              />
            </div> */}

            {/* Botones */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={closeModal}>
                Cancelar
              </Button>
              <SubmitButton
                label={mode === 'CREATE' ? 'Crear slide' : 'Guardar cambios'}
                className='min-w-[120px]'
                type='button'
                onClick={testimonialForm.handleSubmit(onSubmit, onError)}
                showSpinner={testimonialForm.formState.isSubmitting}
                disabled={testimonialForm.formState.isSubmitting}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TestimonialModal };

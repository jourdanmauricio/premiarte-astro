import type z from 'zod';
import type { UseFormReturn } from 'react-hook-form';

import InputField from '@/components/ui/custom/input-field';
import type { SettingsFormSchema } from '@/shared/schemas';
import { useCallback, useMemo, useState } from 'react';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { getTestimonialColumns } from '@/components/dashboard/settings/sections/home/panels/testimonials-panel/table/testimonialsColumns';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { TestimonialModal } from '@/components/dashboard/settings/sections/home/panels/testimonials-panel/TestimonialModal';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';

interface TestimonialsPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
}

const TestimonialsPanel = ({ form }: TestimonialsPanelProps) => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [testimonialModalIsOpen, setTestimonialModalIsOpen] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState<
    number | null
  >(null);

  const testimonials = form.watch('home.testimonials') || [];

  const handleAddSlide = useCallback(() => {
    setCurrentTestimonialIndex(null);
    setTestimonialModalIsOpen(true);
  }, []);

  const handleEditSlide = useCallback((index: number) => {
    setCurrentTestimonialIndex(index);
    setTestimonialModalIsOpen(true);
  }, []);

  const handleDeleteSlide = useCallback((index: number) => {
    setCurrentTestimonialIndex(index);
    setDeleteModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentTestimonialIndex !== null) {
      const currentSlides = form.getValues('home.testimonials') || [];
      const newSlides = currentSlides.testimonials.filter(
        (_, index) => index !== currentTestimonialIndex
      );
      form.setValue('home.testimonials.testimonials', newSlides, {
        shouldDirty: true,
      });
      setDeleteModalIsOpen(false);
      setCurrentTestimonialIndex(null);
    }
  }, [currentTestimonialIndex, form]);

  const handleMoveSlide = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentTestimonials = [
        ...(form.getValues('home.testimonials.testimonials') || []),
      ];
      const [movedSlide] = currentTestimonials.splice(fromIndex, 1);
      currentTestimonials.splice(toIndex, 0, movedSlide);
      form.setValue('home.testimonials.testimonials', currentTestimonials, {
        shouldDirty: true,
      });
    },
    [form]
  );

  const columns = useMemo(
    () =>
      getTestimonialColumns({
        onEdit: handleEditSlide,
        onDelete: handleDeleteSlide,
        onMove: handleMoveSlide,
      }),
    [handleEditSlide, handleDeleteSlide, handleMoveSlide]
  );

  // Enriquecer testimonials con índice
  const enrichedTestimonials = useMemo(() => {
    return (testimonials.testimonials || []).map((testimonial, index) => ({
      ...testimonial,
      index,
    }));
  }, [testimonials.testimonials]);

  const currentTestimonial =
    currentTestimonialIndex !== null
      ? testimonials.testimonials[currentTestimonialIndex]
      : null;

  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Sección Testimonios</h2>
      <div className='grid grid-cols-2 gap-4 p-6'>
        <div className='w-full'>
          <InputField
            label='Título'
            name='home.testimonials.title'
            form={form}
          />
        </div>
        <div className='flex items-center gap-2 px-6 justify-end'>
          <span className='text-sm text-gray-500'>
            {testimonials.testimonials && testimonials.testimonials.length}{' '}
            testimonio
            {testimonials.testimonials && testimonials.testimonials.length !== 1
              ? 's'
              : ''}
          </span>
          <Button type='button' variant='default' onClick={handleAddSlide}>
            <PlusIcon className='size-5 mr-2' />
            Agregar Testimonio
          </Button>
        </div>
      </div>
      <div className='px-6'>
        <CustomTable
          data={enrichedTestimonials}
          columns={columns}
          isLoading={false}
          globalFilter={{}}
          error={false}
          sorting={[]}
          handleSorting={() => {}}
          pageIndex={0}
          setPageIndex={() => {}}
          globalFilterFn={() => true}
        />
      </div>

      {/* Modal de edición/creación */}
      {testimonialModalIsOpen && (
        <TestimonialModal
          open={testimonialModalIsOpen}
          closeModal={() => {
            setTestimonialModalIsOpen(false);
            setCurrentTestimonialIndex(null);
          }}
          testimonial={currentTestimonial}
          testimonialIndex={currentTestimonialIndex}
          form={form}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentTestimonialIndex !== null && (
        <CustomAlertDialog
          title='Eliminar testimonio'
          description={`¿Estás seguro de querer eliminar el testimonio "${currentTestimonial?.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentTestimonialIndex(null);
          }}
        />
      )}
    </>
  );
};

export default TestimonialsPanel;

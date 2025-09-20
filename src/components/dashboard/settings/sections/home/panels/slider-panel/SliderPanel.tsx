import type { z } from 'zod';
import { PlusIcon } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import type { Image, Settings } from '@/shared/types';
import { getSlideColumns } from './table/slideColumns';
import type { SettingsFormSchema } from '@/shared/schemas';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { SlideModal } from '@/components/dashboard/settings/sections/home/panels/slider-panel/SlideModal';

interface Props {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
  images: Image[];
  settingsData: Settings[];
}

// Tipo para los slides en el form
type SlideFormData = z.infer<typeof SettingsFormSchema>['home']['slider'][0];

const SliderPanel = ({ form, images, settingsData }: Props) => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [slideModalIsOpen, setSlideModalIsOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number | null>(
    null
  );

  // Obtener slides del form
  const slides = form.watch('home.slider') || [];

  const handleAddSlide = useCallback(() => {
    setCurrentSlideIndex(null);
    setSlideModalIsOpen(true);
  }, []);

  const handleEditSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
    setSlideModalIsOpen(true);
  }, []);

  const handleDeleteSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
    setDeleteModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentSlideIndex !== null) {
      const currentSlides = form.getValues('home.slider') || [];
      const newSlides = currentSlides.filter(
        (_, index) => index !== currentSlideIndex
      );
      form.setValue('home.slider', newSlides, { shouldDirty: true });
      setDeleteModalIsOpen(false);
      setCurrentSlideIndex(null);
    }
  }, [currentSlideIndex, form]);

  const handleMoveSlide = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentSlides = [...(form.getValues('home.slider') || [])];
      const [movedSlide] = currentSlides.splice(fromIndex, 1);
      currentSlides.splice(toIndex, 0, movedSlide);
      form.setValue('home.slider', currentSlides, { shouldDirty: true });
    },
    [form]
  );

  // Crear datos enriquecidos para la tabla
  const enrichedSlides = useMemo(() => {
    return slides.map((slide, index) => {
      const image = images.find((img) => img.id === slide.image);
      return {
        ...slide,
        index,
        imageUrl: image?.url || '',
        imageAlt: image?.alt || 'Sin imagen',
      };
    });
  }, [slides, images]);

  const columns = useMemo(
    () =>
      getSlideColumns({
        onEdit: handleEditSlide,
        onDelete: handleDeleteSlide,
        onMove: handleMoveSlide,
      }),
    [handleEditSlide, handleDeleteSlide, handleMoveSlide]
  );

  const currentSlide =
    currentSlideIndex !== null ? slides[currentSlideIndex] : null;

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>Slider Principal</h2>
        <div className='flex items-center gap-2 px-6'>
          <span className='text-sm text-gray-500'>
            {slides.length} slide{slides.length !== 1 ? 's' : ''}
          </span>
          <Button type='button' variant='default' onClick={handleAddSlide}>
            <PlusIcon className='size-5 mr-2' />
            Agregar Slide
          </Button>
        </div>
      </div>

      <div className='px-6'>
        <CustomTable
          data={enrichedSlides}
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

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentSlideIndex !== null && (
        <CustomAlertDialog
          title='Eliminar slide'
          description={`¿Estás seguro de querer eliminar el slide "${currentSlide?.title}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentSlideIndex(null);
          }}
        />
      )}

      {/* Modal de edición/creación */}
      {slideModalIsOpen && (
        <SlideModal
          open={slideModalIsOpen}
          closeModal={() => {
            setSlideModalIsOpen(false);
            setCurrentSlideIndex(null);
          }}
          slide={currentSlide}
          slideIndex={currentSlideIndex}
          images={images}
          form={form}
        />
      )}
    </>
  );
};

export { SliderPanel };

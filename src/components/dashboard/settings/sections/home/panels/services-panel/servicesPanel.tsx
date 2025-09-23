import type z from 'zod';
import { PlusIcon } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { useCallback, useMemo, useState } from 'react';

import type { Image } from '@/shared/types';
import { Button } from '@/components/ui/button';
import type { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { ServiceModal } from '@/components/dashboard/settings/sections/home/panels/services-panel/ServiceModal';
import { getServiceColumns } from '@/components/dashboard/settings/sections/home/panels/services-panel/table/serviceColumns';

interface ServicesPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
  images: Image[];
}

const ServicesPanel = ({ form, images }: ServicesPanelProps) => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [serviceModalIsOpen, setServiceModalIsOpen] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(
    null
  );

  const services = form.watch('home.services') || [];

  const handleAddSlide = useCallback(() => {
    setCurrentServiceIndex(null);
    setServiceModalIsOpen(true);
  }, []);

  const handleEditSlide = useCallback((index: number) => {
    setCurrentServiceIndex(index);
    setServiceModalIsOpen(true);
  }, []);

  const handleDeleteSlide = useCallback((index: number) => {
    setCurrentServiceIndex(index);
    setDeleteModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentServiceIndex !== null) {
      const currentSlides = form.getValues('home.services') || [];
      const newSlides = currentSlides.services.filter(
        (_, index) => index !== currentServiceIndex
      );
      form.setValue('home.services.services', newSlides, {
        shouldDirty: true,
      });
      setDeleteModalIsOpen(false);
      setCurrentServiceIndex(null);
    }
  }, [currentServiceIndex, form]);

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

  // Crear datos enriquecidos para la tabla
  const enrichedServices = useMemo(() => {
    return services.services.map((service, index) => {
      const image = images.find((img) => img.id === service.image);
      return {
        ...service,
        index,
        imageUrl: image?.url || '',
        imageAlt: image?.alt || 'Sin imagen',
      };
    });
  }, [services.services, images]);

  const columns = useMemo(
    () =>
      getServiceColumns({
        onEdit: handleEditSlide,
        onDelete: handleDeleteSlide,
        onMove: handleMoveSlide,
      }),
    [handleEditSlide, handleDeleteSlide, handleMoveSlide]
  );

  const currentService =
    currentServiceIndex !== null
      ? services.services[currentServiceIndex]
      : null;

  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Sección Servicios</h2>
      <div className='grid grid-cols-2 gap-4 p-6'>
        <div className='w-full space-y-2'>
          <InputField label='Título' name='home.services.title' form={form} />

          <InputField
            label='Subtítulo'
            name='home.services.subtitle'
            form={form}
            placeholder='Subtítulo'
          />
        </div>
        <div className='flex items-center gap-2 px-6 justify-end'>
          <span className='text-sm text-gray-500'>
            {services.services && services.services.length} servicio
            {services.services && services.services.length !== 1 ? 's' : ''}
          </span>
          <Button type='button' variant='default' onClick={handleAddSlide}>
            <PlusIcon className='size-5 mr-2' />
            Agregar Servicio
          </Button>
        </div>
      </div>
      <div className='px-6'>
        <CustomTable
          data={enrichedServices}
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
      {serviceModalIsOpen && (
        <ServiceModal
          open={serviceModalIsOpen}
          closeModal={() => {
            setServiceModalIsOpen(false);
            setCurrentServiceIndex(null);
          }}
          service={currentService}
          serviceIndex={currentServiceIndex}
          form={form}
          images={images}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentServiceIndex !== null && (
        <CustomAlertDialog
          title='Eliminar testimonio'
          description={`¿Estás seguro de querer eliminar el testimonio "${currentService?.title}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentServiceIndex(null);
          }}
        />
      )}
    </>
  );
};

export default ServicesPanel;

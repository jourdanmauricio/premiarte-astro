import { useState } from 'react';
import { type UseFormReturn, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mediaService } from '@/lib/services/mediaService';
import type { Image } from '@/shared/types';
import { ImageCard } from './ImageCard';
import { ImageSelectorModal } from './Modal/ImageSelectorModal';

type ImageSelectorProps = {
  label: string;
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  maxImages?: number;
  defaultTag?: string;
};

export default function ImageSelector({
  label,
  name,
  form,
  className,
  labelClassName,
  maxImages = 10,
  defaultTag = 'Otros',
}: ImageSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const { data: allImages } = useQuery<Image[]>({
    queryKey: ['images'],
    queryFn: () => mediaService.getImages(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedImageIds: number[] = form.watch(name) || [];

  // Convertir IDs a objetos completos para la visualización

  console.log('selectedImageIds', selectedImageIds);
  const selectedImages: Image[] = selectedImageIds
    .map((id) => allImages?.find((img) => img.id === id))
    .filter((img): img is Image => img !== undefined);

  console.log('selectedImages', selectedImages);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = selectedImageIds.findIndex(
        (id) => id.toString() === active.id
      );
      const newIndex = selectedImageIds.findIndex(
        (id) => id.toString() === over?.id
      );

      const reorderedIds = arrayMove(selectedImageIds, oldIndex, newIndex);
      form.setValue(name, reorderedIds, { shouldDirty: true });
      form.clearErrors(name);
    }
  };

  const handleRemoveImage = (imageId: number) => {
    const updatedIds = selectedImageIds.filter((id) => id !== imageId);
    form.setValue(name, updatedIds, { shouldDirty: true });
    form.clearErrors(name);
  };

  const handleSelectImages = (images: Image[]) => {
    const currentIds = selectedImageIds || [];
    const newIds = images
      .filter((img) => !currentIds.includes(img.id))
      .map((img) => img.id);

    const totalIds = [...currentIds, ...newIds].slice(0, maxImages);
    form.setValue(name, totalIds, { shouldDirty: true });
    form.clearErrors(name);
    setIsModalOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelClassName}>{label}</FormLabel>

          <div className='space-y-4'>
            {/* Botón para agregar imágenes */}
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsModalOpen(true)}
              className='w-full border-dashed border-2 h-32 flex flex-col items-center justify-center gap-2 hover:bg-muted/50'
              disabled={selectedImages.length >= maxImages}
            >
              <Plus className='h-8 w-8 text-muted-foreground' />
              <span className='text-muted-foreground'>
                {selectedImages.length === 0
                  ? 'Agregar imágenes'
                  : `Agregar más imágenes (${selectedImages.length}/${maxImages})`}
              </span>
            </Button>

            {/* Grid de imágenes seleccionadas */}
            {selectedImages.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedImages.map((img) => img.id.toString())}
                  strategy={rectSortingStrategy}
                >
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {selectedImages.map((image, index) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        index={index}
                        onRemove={handleRemoveImage}
                        isPrimary={index === 0}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Error message */}
          <div
            className={`relative transition-all duration-300 ease-in-out ${
              fieldState.invalid ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <FormMessage className='absolute -top-1 font-normal' />
          </div>

          {/* Modal de selección */}
          <ImageSelectorModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleSelectImages}
            allImages={allImages || []}
            selectedImageIds={selectedImageIds}
            maxImages={maxImages}
            defaultTag={defaultTag}
          />
        </FormItem>
      )}
    />
  );
}

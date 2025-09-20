import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Image } from '@/shared/types';

interface ImageCardProps {
  image: Image;
  index: number;
  onRemove: (id: number) => void;
  isPrimary?: boolean;
}

export function ImageCard({
  image,
  index,
  onRemove,
  isPrimary,
}: ImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 border-primary z-50' : 'border-border'
      } ${isPrimary ? 'ring-2 ring-primary' : ''}`}
      {...attributes}
    >
      {/* Imagen */}
      <div className='aspect-square relative'>
        <img
          src={image.url}
          alt={image.alt}
          className='w-full h-full object-cover'
          draggable={false}
        />

        {/* Overlay con acciones */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200'>
          {/* Botón de eliminar */}
          <Button
            type='button'
            size='sm'
            variant='destructive'
            className='absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
            onClick={(e) => {
              e.preventDefault();
              onRemove(image.id);
            }}
          >
            <X className='h-4 w-4' />
          </Button>

          {/* Handle para arrastrar */}
          <div
            {...listeners}
            className='absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded p-1'
          >
            <GripVertical className='h-4 w-4 text-gray-600' />
          </div>

          {/* Badge de imagen principal */}
          {isPrimary && (
            <Badge className='absolute bottom-2 left-2 bg-primary text-primary-foreground'>
              <Star className='h-3 w-3 mr-1' />
              Principal
            </Badge>
          )}

          {/* Número de orden */}
          <div className='absolute bottom-2 right-2 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            #{index + 1}
          </div>
        </div>
      </div>

      {/* Información de la imagen */}
      <div className='p-3'>
        <p className='text-sm font-medium text-gray-900 truncate'>
          {image.alt || 'Sin título'}
        </p>
        {image.tag && (
          <p className='text-xs text-gray-500 mt-1 truncate'>{image.tag}</p>
        )}
      </div>
    </div>
  );
}

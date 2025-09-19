import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';

// Tipo para los datos enriquecidos de slides
type EnrichedSlide = {
  index: number;
  image: number;
  imageUrl: string;
  imageAlt: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
  recommended: boolean;
};

type DataTableColumnsProps = {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

export const getSlideColumns = ({
  onEdit,
  onDelete,
  onMove,
}: DataTableColumnsProps): ColumnDef<EnrichedSlide>[] => [
  {
    accessorKey: 'index',
    header: 'ORDEN',
    size: 80,
    cell: ({ row }) => {
      const slide = row.original;
      const isFirst = slide.index === 0;
      const isLast = slide.index === row.getParentRows().length - 1;

      return (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-gray-700'>#{slide.index + 1}</span>
          <div className='flex flex-col'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(slide.index, slide.index - 1)}
              disabled={isFirst}
              className='h-6 w-6 p-0 hover:bg-blue-50'
              type='button'
            >
              <ArrowUpIcon className='h-3 w-3 text-blue-600' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(slide.index, slide.index + 1)}
              disabled={isLast}
              className='h-6 w-6 p-0 hover:bg-blue-50'
              type='button'
            >
              <ArrowDownIcon className='h-3 w-3 text-blue-600' />
            </Button>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'image',
    header: 'IMAGEN',
    size: 100,
    cell: ({ row }) => {
      const slide = row.original;

      return (
        <div className='flex items-center justify-center'>
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt}
              className='w-12 h-12 object-contain rounded-md border'
            />
          ) : (
            <div className='w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs'>
              Sin imagen
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: 'TÍTULO',
    size: 200,
    cell: ({ row }) => {
      const slide = row.original;
      return <TruncatedCell value={slide.title} linesMax={2} />;
    },
  },
  {
    accessorKey: 'text',
    header: 'TEXTO',
    size: 0,
    minSize: 200,
    cell: ({ row }) => {
      const slide = row.original;
      return <TruncatedCell value={slide.text || 'Sin texto'} linesMax={2} />;
    },
  },
  {
    accessorKey: 'buttonText',
    header: 'BOTÓN',
    size: 150,
    cell: ({ row }) => {
      const slide = row.original;
      return (
        <div className='flex flex-col gap-1'>
          <TruncatedCell value={slide.buttonText || ''} linesMax={1} />
          <a
            href={slide.buttonLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-blue-600 hover:underline truncate'
          >
            {slide.buttonLink}
          </a>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'recommended',
  //   header: 'RECOMENDADO',
  //   size: 100,
  //   cell: ({ row }) => {
  //     const slide = row.original;
  //     return (
  //       <span
  //         className={`px-2 py-1 rounded-full text-xs font-medium ${
  //           slide.recommended
  //             ? 'bg-green-100 text-green-800'
  //             : 'bg-gray-100 text-gray-600'
  //         }`}
  //       >
  //         {slide.recommended ? 'Sí' : 'No'}
  //       </span>
  //     );
  //   },
  // },
  {
    id: 'actions',
    header: 'ACCIONES',
    size: 120,
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const slide = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(slide.index)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
            type='button'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(slide.index)}
            className='h-8 w-8 p-0 hover:bg-red-50'
            type='button'
          >
            <Trash2Icon className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      );
    },
  },
];

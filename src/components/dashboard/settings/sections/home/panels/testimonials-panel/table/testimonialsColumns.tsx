import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';

// Tipo para los datos enriquecidos de testimonials
type EnrichedTestimonial = {
  index: number;
  name: string;
  rating: string;
  description: string;
};

type DataTableColumnsProps = {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

export const getTestimonialColumns = ({
  onEdit,
  onDelete,
  onMove,
}: DataTableColumnsProps): ColumnDef<EnrichedTestimonial>[] => [
  {
    accessorKey: 'index',
    header: 'ORDEN',
    size: 80,
    cell: ({ row }) => {
      const testimonial = row.original;
      const isFirst = testimonial.index === 0;
      const isLast = testimonial.index === row.getParentRows().length - 1;

      return (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-gray-700'>
            #{testimonial.index + 1}
          </span>
          <div className='flex flex-col'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(testimonial.index, testimonial.index - 1)}
              disabled={isFirst}
              className='h-6 w-6 p-0 hover:bg-blue-50'
              type='button'
            >
              <ArrowUpIcon className='h-3 w-3 text-blue-600' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(testimonial.index, testimonial.index + 1)}
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
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 170,
    cell: ({ row }) => <TruncatedCell value={row.original.name} linesMax={2} />,
  },
  {
    accessorKey: 'rating',
    header: 'PUNTUACIÓN',
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.rating} linesMax={2} />
    ),
  },
  {
    accessorKey: 'description',
    header: 'TEXTO',
    size: 0,
    minSize: 200,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.description} linesMax={2} />
    ),
  },
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

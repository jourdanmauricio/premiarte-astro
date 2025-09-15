import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Category } from '@/shared/types';

type DataTableColumnsProps = {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export const getCategoryColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: 'image',
    header: 'IMAGEN',
    size: 100,
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className='flex items-center justify-center'>
          {category.image ? (
            <img
              src={category.image.url}
              alt={category.name}
              className='w-12 h-12 object-cover rounded-md border'
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
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 140,
    cell: ({ row }) => {
      const category = row.original;
      return <TruncatedCell value={category.name} linesMax={2} />;
    },
  },
  {
    accessorKey: 'featured',
    header: 'DESTACADA',
    size: 100,
    cell: ({ row }) => (row.original.featured ? 'Si' : 'No'),
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPCIÓN',
    size: 0,
    minSize: 250,
    cell: ({ row }) => {
      const category = row.original;
      return <TruncatedCell value={category.description} linesMax={2} />;
    },
  },

  {
    id: 'actions',
    header: 'ACCIONES',
    size: 120,
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(category)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(category)}
            className='h-8 w-8 p-0 hover:bg-red-50'
          >
            <Trash2Icon className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      );
    },
  },
];

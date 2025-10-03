import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Category, Responsible } from '@/shared/types';

type DataTableColumnsProps = {
  onEdit: (responsible: Responsible) => void;
  onDelete: (responsible: Responsible) => void;
};

export const getResponsibleColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<Responsible>[] => [
  {
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 0,
    minSize: 200,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'cuit',
    header: 'CUIT',
    size: 160,
    cell: ({ row }) => row.original.cuit,
  },
  {
    accessorKey: 'condition',
    header: 'CONDICIÓN',
    size: 250,
    cell: ({ row }) => row.original.condition,
  },
  {
    accessorKey: 'observation',
    header: 'OBSERVACIÓN',
    size: 0,
    minSize: 250,
    cell: ({ row }) => {
      const responsible = row.original;
      return (
        <TruncatedCell value={responsible.observation || ''} linesMax={2} />
      );
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

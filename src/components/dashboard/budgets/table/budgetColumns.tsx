import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

import type { Budget } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import { budgetStatusList } from '@/shared/consts';

type DataTableColumnsProps = {
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
};

export const getBudgetColumns = ({
  onDelete,
  onEdit,
}: DataTableColumnsProps): ColumnDef<Budget>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'name',
    header: 'CLIENTE',
    size: 200,
    cell: ({ row }) => <TruncatedCell value={row.original.name} linesMax={2} />,
  },
  // {
  //   accessorKey: 'email',
  //   header: 'EMAIL',
  //   size: 250,
  //   cell: ({ row }) => (
  //     <TruncatedCell value={row.original.email} linesMax={2} />
  //   ),
  // },
  // {
  //   accessorKey: 'phone',
  //   header: 'TELÉFONO',
  //   size: 150,
  //   cell: ({ row }) => row.original.phone || 'No especificado',
  // },
  {
    accessorKey: 'status',
    header: 'ESTADO',
    size: 100,
    cell: ({ row }) =>
      budgetStatusList.find((status) => status.id === row.original.status)
        ?.description,
  },
  {
    accessorKey: 'type',
    header: 'TIPO',
    size: 100,
    cell: ({ row }) =>
      row.original.type === 'wholesale' ? 'Mayorista' : 'Minorista',
  },
  {
    accessorKey: 'totalAmount',
    header: 'TOTAL',
    size: 100,
    cell: ({ row }) => `$${row.original.totalAmount}`,
  },
  {
    accessorKey: 'createdAt',
    header: 'FECHA CREACIÓN',
    size: 150,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: 'observation',
    header: 'OBSERVACIÓN',
    size: 0,
    minSize: 200,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.observation ?? ''} linesMax={2} />
    ),
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      const budget = row.original;
      return (
        <div className='flex items-center justify-center w-full'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(budget)}
            className='h-8 w-8 p-0 hover:bg-red-50'
            type='button'
          >
            <EyeIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(budget)}
            className='h-8 w-8 p-0 hover:bg-red-50'
            type='button'
          >
            <PencilIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(budget)}
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

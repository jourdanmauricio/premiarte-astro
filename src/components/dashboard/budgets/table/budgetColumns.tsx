import { EditIcon, FileText, PackagePlus, Trash2Icon } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

import type { Budget } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import { budgetStatusList } from '@/shared/consts';

type DataTableColumnsProps = {
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onView: (budget: Budget) => void;
  onCreateOrder: (budget: Budget) => void;
};

export const getBudgetColumns = ({
  onDelete,
  onEdit,
  onView,
  onCreateOrder,
}: DataTableColumnsProps): ColumnDef<Budget>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 60,
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'name',
    header: 'CLIENTE',
    size: 200,
    cell: ({ row }) => <TruncatedCell value={row.original.name} linesMax={2} />,
  },

  {
    accessorKey: 'status',
    header: 'ESTADO',
    size: 100,
    cell: ({ row }) => {
      const budget = row.original;

      let color = 'text-neutral-700';

      if (
        budget.status === 'sent' &&
        budget.expiresAt &&
        new Date(budget.expiresAt) < new Date()
      )
        'text-red-500';

      if (
        budget.status === 'pending' &&
        budget.createdAt &&
        new Date(budget.createdAt) <
          new Date(new Date().setDate(new Date().getDate() - 1))
      ) {
        color = 'text-yellow-500';
      }

      return (
        <span className={color}>
          {
            budgetStatusList.find((status) => status.id === budget.status)
              ?.description
          }
        </span>
      );
    },
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
    size: 160,
    cell: ({ row }) => {
      const budget = row.original;
      return (
        <div className='flex items-center justify-center w-full gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onCreateOrder(budget)}
            className='h-8 w-8 p-0 hover:bg-green-50'
            type='button'
          >
            <PackagePlus className='h-4 w-4 text-green-800' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onView(budget)}
            className='h-8 w-8 p-0 hover:bg-slate-50'
            type='button'
          >
            <FileText className='h-4 w-4 text-slate-800' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(budget)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
            type='button'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
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

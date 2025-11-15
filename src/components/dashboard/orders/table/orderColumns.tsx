import {
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import {  orderStatusList } from '@/shared/consts';
import type { Order } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type DataTableColumnsProps = {
  onDelete: (order: Order) => void;
  onEdit: (order: Order) => void;
};

export const getOrderColumns = ({
  onDelete,
  onEdit,
}: DataTableColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'name',
    header: 'CLIENTE',
    size: 250,
    cell: ({ row }) => <TruncatedCell value={row.original.name} linesMax={2} />,
  },
  {
    accessorKey: 'status',
    header: 'ESTADO',
    size: 130,
    cell: ({ row }) => {
      const order = row.original;

      let color = 'text-neutral-700';
      let bgColor = 'bg-transparent';


      if (order.status === 'pending') {
        color = 'text-yellow-900';
        bgColor = 'bg-yellow-400';
      }

      return (
        <div className='mx-auto'>
          <Badge variant='outline' className={cn('text-xs', color, bgColor)}>
            {
              orderStatusList.find((status) => status.id === order.status)
                ?.description
            }
          </Badge>
        </div>
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
    size: 90,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className='flex items-center justify-center w-full'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(order)}
            className='h-8 w-8 p-0 hover:bg-red-50'
            type='button'
          >
            <PencilIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(order)}
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

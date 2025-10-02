import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Customer } from '@/shared/types';

type DataTableColumnsProps = {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

export const getCustomerColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<Customer>[] => [
  {
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 0,
    minSize: 200,
    cell: ({ row }) => {
      const customer = row.original;
      return <TruncatedCell value={customer.name} linesMax={2} />;
    },
  },
  {
    accessorKey: 'email',
    header: 'EMAIL',
    size: 0,
    minSize: 250,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.email} linesMax={2} />
    ),
  },
  {
    accessorKey: 'phone',
    header: 'TELÉFONO',
    size: 150,
    cell: ({ row }) => {
      const customer = row.original;
      return <TruncatedCell value={customer.phone} linesMax={2} />;
    },
  },
  {
    accessorKey: 'document',
    header: 'DOCUMENTO',
    size: 150,
    cell: ({ row }) => {
      const customer = row.original;
      return <TruncatedCell value={customer.document || '-'} linesMax={2} />;
    },
  },
  {
    accessorKey: 'type',
    header: 'TIPO',
    size: 150,
    cell: ({ row }) => {
      const customer = row.original;
      return customer.type === 'wholesale' ? 'Mayorista' : 'Minorista';
    },
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    size: 120,
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(customer)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(customer)}
            className='h-8 w-8 p-0 hover:bg-red-50'
          >
            <Trash2Icon className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      );
    },
  },
];

import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { NewsletterSubscriber } from '@/shared/types';

type DataTableColumnsProps = {
  onDelete: (newsletter: NewsletterSubscriber) => void;
};

export const getNewsletterColumns = ({
  onDelete,
}: DataTableColumnsProps): ColumnDef<NewsletterSubscriber>[] => [
  {
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 0,
    minSize: 200,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'email',
    header: 'EMAIL',
    size: 0,
    minSize: 200,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.email} linesMax={2} />
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'ACTIVO',
    size: 80,
    cell: ({ row }) => (row.original.isActive ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'subscribedAt',
    header: 'FECHA SUSCRIPCIÓN',
    size: 180,
    cell: ({ row }) => new Date(row.original.subscribedAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      const newsletter = row.original;
      return (
        <div className='flex items-center justify-center w-full'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(newsletter)}
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

import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Contact } from '@/shared/types/contact';

type DataTableColumnsProps = {
  onDelete: (contact: Contact) => void;
  onView: (contact: Contact) => void;
};

export const getContactColumns = ({
  onDelete,
  onView,
}: DataTableColumnsProps): ColumnDef<Contact>[] => [
  {
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 0,
    minSize: 180,
    cell: ({ row }) => row.original.name,
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
    size: 0,
    minSize: 120,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.phone} linesMax={2} />
    ),
  },
  {
    accessorKey: 'message',
    header: 'MENSAJE',
    size: 0,
    minSize: 200,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.message} linesMax={2} />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'FECHA CREACIÓN',
    size: 150,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className='flex items-center justify-center w-full'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onView(contact)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
            type='button'
          >
            <EyeIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(contact)}
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

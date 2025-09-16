import { type ColumnDef } from '@tanstack/react-table';

import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import DataTableRowActions from './data-table-row-actions';
import type { Image } from '@/shared/types';

type DataTableColumnsProps = {
  onEdit: (value: Image) => void;
  onDelete: (value: Image) => void;
};

export const getMediaColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<Image, any>[] => [
  {
    accessorKey: 'url',
    header: 'IMAGEN',
    cell: ({ row }) => (
      <img
        src={row.getValue('url') as string}
        alt={row.getValue('alt') as string}
        className='w-10 h-10 object-contain'
        loading='lazy'
      />
    ),
    size: 70,
    enableSorting: false,
  },
  {
    accessorKey: 'tag',
    header: 'TAG',
    accessorFn: (row) => row.tag,
    cell: ({ row }) => (
      <div className='line-clamp-2 break-words w-full'>
        {row.getValue('tag') ?? '-'}
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'alt',
    header: 'ALT',
    accessorFn: (row) => row.alt,
    cell: ({ row }) => (
      <div className='line-clamp-2 break-words w-full'>
        {row.getValue('alt') ?? '-'}
      </div>
      // <div className='mr-auto'>{row.getValue('alt') ?? '-'}</div>
    ),
    size: 0,
    minSize: 150,
  },
  {
    accessorKey: 'observation',
    header: 'OBSERVACIÓN',
    accessorFn: (row) => row.observation,
    cell: ({ row }) => (
      <TruncatedCell value={row.getValue('observation') ?? '-'} linesMax={2} />
    ),
    size: 0,
    minSize: 100,
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
    size: 100,
    enableSorting: false,
  },
];

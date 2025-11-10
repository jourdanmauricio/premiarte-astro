import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { SocialLink } from '@/shared/types';

// Tipo para los datos enriquecidos de social links
type EnrichedSocialLink = {
  index: number;
  label?: string;
  image?: number;
  href?: string;
  imageUrl: string;
  imageAlt: string;
};

type DataTableColumnsProps = {
  onEdit: (socialLink: SocialLink) => void;
  onDelete: (socialLink: SocialLink) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

export const getSocialLinkColumns = ({
  onEdit,
  onDelete,
  onMove,
}: DataTableColumnsProps): ColumnDef<EnrichedSocialLink>[] => [
  {
    accessorKey: 'index',
    header: 'ORDEN',
    size: 80,
    cell: ({ row }) => {
      const socialLink = row.original;
      const isFirst = socialLink.index === 0;
      const isLast = socialLink.index === row.getParentRows().length - 1;

      return (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-gray-700'>
            #{socialLink.index + 1}
          </span>
          <div className='flex flex-col'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(socialLink.index, socialLink.index - 1)}
              disabled={isFirst}
              className='h-6 w-6 p-0 hover:bg-blue-50'
              type='button'
            >
              <ArrowUpIcon className='h-3 w-3 text-blue-600' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onMove(socialLink.index, socialLink.index + 1)}
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
    accessorKey: 'image',
    header: 'IMAGEN',
    size: 100,
    cell: ({ row }) => {
      const service = row.original;

      return (
        <div className='flex items-center justify-center'>
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.imageAlt}
              className='w-12 h-12 object-contain rounded-md border'
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
    accessorKey: 'label',
    header: 'ETIQUETA',
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell
        value={row.original.label || 'Sin etiqueta'}
        linesMax={2}
      />
    ),
  },
  {
    accessorKey: 'href',
    header: 'ENLACE',
    minSize: 200,
    size: 0,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.href || 'Sin enlace'} linesMax={1} />
    ),
  },

  {
    id: 'actions',
    header: 'ACCIONES',
    size: 120,
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const socialLink = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(socialLink as SocialLink)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
            type='button'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(socialLink as SocialLink)}
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

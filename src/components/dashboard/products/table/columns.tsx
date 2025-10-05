import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Product, ProductWithDetails } from '@/shared/types';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

type DataTableColumnsProps = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export const getProductColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<ProductWithDetails>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 56,
  },
  {
    accessorKey: 'images',
    header: 'IMAGEN',
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      const product = row.original;
      const firstImage = product.detImages?.[0];

      return (
        <div className='flex items-center justify-center'>
          {firstImage ? (
            <img
              src={firstImage.url}
              alt={firstImage.alt || product.name}
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
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'NOMBRE',
    size: 0,
    minSize: 250,
    cell: ({ row }) => {
      const product = row.original;
      return <TruncatedCell value={product.name} linesMax={2} />;
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    size: 100,
    minSize: 80,
    cell: ({ row }) => row.original.sku ?? '-',
  },
  {
    accessorKey: 'price',
    header: 'PRECIO',
    size: 140,
    cell: ({ row }) => {
      const product = row.original;
      const retailPrice = product.retailPrice ?? 0;
      const wholesalePrice = product.wholesalePrice ?? 0;
      return (
        <div className='text-sm flex flex-col'>
          <span>Min: ${retailPrice.toLocaleString()}</span>
          <span>May: ${wholesalePrice.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'priceUpdatedAt',
    header: 'F ACT PRECIO',
    size: 150,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className='text-sm flex flex-col'>
          <span>
            {product.priceUpdatedAt
              ? format(new Date(product.priceUpdatedAt), 'dd/MM/yyyy')
              : '-'}
          </span>
          <span>{product.priceUpdated ? product.priceUpdated : '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'categories',
    header: 'CATEGORÍAS',
    size: 0,
    minSize: 180,
    cell: ({ row }) => {
      const product = row.original;
      if (!product.categories || product.categories.length === 0) {
        return <span className='text-gray-400 text-xs'>Sin categoría</span>;
      }

      if (!product.detCategories || product.detCategories.length === 0) {
        return <span className='text-gray-400 text-xs'>Sin categoría</span>;
      }

      const categoryNames = product.detCategories
        .map((cat) => cat.name)
        .join(', ');
      return <TruncatedCell value={categoryNames} linesMax={2} />;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'ESTADO',
    size: 100,
    minSize: 80,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.isActive ? 'Activo' : 'Inactivo'}
        </span>
      );
    },
  },
  {
    accessorKey: 'isFeatured',
    header: 'DESTACADO',
    size: 100,
    minSize: 80,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isFeatured
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.isFeatured ? 'Sí' : 'No'}
        </span>
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
      const product = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(product)}
            className='h-8 w-8 p-0 hover:bg-blue-50'
          >
            <EditIcon className='h-4 w-4 text-blue-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(product)}
            className='h-8 w-8 p-0 hover:bg-red-50'
          >
            <Trash2Icon className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      );
    },
  },
];

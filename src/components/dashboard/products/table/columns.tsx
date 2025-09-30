import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';
import type { Product, ProductWithDetails } from '@/shared/types';
import { format } from 'date-fns';

type DataTableColumnsProps = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export const getProductColumns = ({
  onEdit,
  onDelete,
}: DataTableColumnsProps): ColumnDef<ProductWithDetails>[] => [
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
    size: 120,
    minSize: 100,
    cell: ({ row }) => {
      const product = row.original;
      const price = product.price ?? 0;
      return <span className='font-medium'>${price.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'priceUpdatedAt',
    header: 'F ACT PRECIO',
    size: 130,
    cell: ({ row }) =>
      row.original.priceUpdatedAt
        ? format(new Date(row.original.priceUpdatedAt), 'dd/MM/yyyy')
        : '-',
  },
  {
    accessorKey: 'categories',
    header: 'CATEGORÍAS',
    size: 150,
    minSize: 120,
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

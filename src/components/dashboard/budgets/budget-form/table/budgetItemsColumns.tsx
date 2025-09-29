import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

import type { Budget, BudgetItem } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';

type DataTableColumnsProps = {
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
};

// Tipo para los datos de la tabla (cada fila será un item individual)
type BudgetItemRow = BudgetItem & {
  budget: Budget; // Referencia al budget padre
};

export const getBudgetItemColumns = ({
  onDelete,
  onEdit,
}: DataTableColumnsProps): ColumnDef<BudgetItemRow>[] => [
  {
    id: 'image',
    header: 'IMAGEN',
    size: 70,
    cell: ({ row }) => (
      <img
        src={row.original.imageUrl}
        alt={row.original.name}
        className='w-10 h-10 object-contain'
      />
    ),
  },
  {
    id: 'name',
    header: 'PRODUCTO',
    size: 0,
    minSize: 200,
    cell: ({ row }) => <TruncatedCell value={row.original.name} linesMax={2} />,
  },
  {
    id: 'sku',
    header: 'SKU',
    size: 120,
    cell: ({ row }) => <TruncatedCell value={row.original.sku} linesMax={1} />,
  },
  {
    id: 'quantity',
    header: 'CANTIDAD',
    size: 100,
    cell: ({ row }) => (
      <div className='text-center'>{row.original.quantity}</div>
    ),
  },
  {
    id: 'price',
    header: 'PRECIO UNIT.',
    size: 120,
    cell: ({ row }) => (
      <div className='text-right'>${(row.original.price / 100).toFixed(2)}</div>
    ),
  },
  {
    id: 'amount',
    header: 'TOTAL',
    size: 120,
    cell: ({ row }) => (
      <div className='text-right font-medium'>
        ${(row.original.amount / 100).toFixed(2)}
      </div>
    ),
  },
  {
    id: 'observation',
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
      const budget = row.original.budget; // Accedemos al budget padre
      return (
        <div className='flex items-center justify-center w-full'>
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

// Función para transformar los datos de Budget[] a BudgetItemRow[]
export const transformBudgetsToItemRows = (
  budgets: Budget[]
): BudgetItemRow[] => {
  const itemRows: BudgetItemRow[] = [];

  budgets.forEach((budget) => {
    if (budget.items && budget.items.length > 0) {
      budget.items.forEach((item) => {
        itemRows.push({
          ...item,
          budget: budget,
        });
      });
    }
  });

  return itemRows;
};

// Exportar el tipo para uso externo
export type { BudgetItemRow };

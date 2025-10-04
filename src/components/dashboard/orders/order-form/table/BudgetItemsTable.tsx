import { useMemo } from 'react';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import {
  getBudgetItemColumns,
  transformBudgetsToItemRows,
} from './budgetItemsColumns';
import type { Budget } from '@/shared/types';

interface BudgetItemsTableProps {
  budgets: Budget[];
  onDelete?: (budget: Budget) => void;
  onEdit?: (budget: Budget) => void;
  isLoading?: boolean;
  error?: boolean;
}

export const BudgetItemsTable = ({
  budgets,
  onDelete = () => {},
  onEdit = () => {},
  isLoading = false,
  error = false,
}: BudgetItemsTableProps) => {
  // Transformar los datos de Budget[] a BudgetItemRow[]
  const itemRows = useMemo(() => {
    return transformBudgetsToItemRows(budgets);
  }, [budgets]);

  // Columnas de la tabla
  const columns = useMemo(
    () =>
      getBudgetItemColumns({
        onDelete,
        onEdit,
      }),
    [onDelete, onEdit]
  );

  return (
    <div className='w-full'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Items de Presupuestos ({itemRows.length} items)
      </h3>
      <CustomTable
        data={itemRows}
        columns={columns}
        isLoading={isLoading}
        error={error}
        sorting={[]}
        handleSorting={() => {}}
        pageIndex={0}
        setPageIndex={() => {}}
        globalFilter={{}}
        globalFilterFn={() => true}
      />
    </div>
  );
};

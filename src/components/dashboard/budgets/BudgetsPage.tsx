import { toast } from 'sonner';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Budget } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import type { SortingState } from '@tanstack/react-table';
import { budgetsService } from '@/lib/services/budgetsService';
import { getBudgetColumns } from '@/components/dashboard/budgets/table/budgetColumns';
import { navigate } from 'astro/virtual-modules/transitions-router.js';

const BudgetsPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await budgetsService.getBudgets();
      return response;
    },
  });

  // console.log('data', data);

  const deleteMutation = useMutation({
    mutationFn: (budgetId: number) => budgetsService.deleteBudget(budgetId),
    onError: (err) => {
      console.error('Error al eliminar presupuesto:', err);
      toast.error('Error al eliminar el presupuesto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentBudget(null);
    },
  });

  const handleDeleteBudget = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    setDeleteModalIsOpen(true);
  }, []);

  const handleEditBudget = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    navigate(`/dashboard/budgets/${budget.id}`);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentBudget !== null) {
      deleteMutation.mutate(currentBudget.id);
    }
  }, [currentBudget]);

  const columns = useMemo(
    () =>
      getBudgetColumns({
        onDelete: handleDeleteBudget,
        onEdit: handleEditBudget,
      }),
    [handleDeleteBudget]
  );

  const handleDownloadTemplate = () => {
    if (!data || data.length === 0) {
      toast.error('No hay presupuestos para descargar');
      return;
    }
  };

  const handleAddBudget = () => {
    navigate('/dashboard/budgets/new');
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Presupuestos
          </h2>

          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleDownloadTemplate}>
              <DownloadIcon className='size-5 mr-2' />
              Descargar Presupuestos
            </Button>
            <Button variant='default' onClick={handleAddBudget}>
              <PlusIcon className='size-5 mr-2' />
              Agregar Presupuesto
            </Button>
          </div>
        </div>

        <CustomTable
          data={data || []}
          columns={columns}
          isLoading={isLoading || deleteMutation.isPending}
          error={!!error}
          sorting={sorting}
          handleSorting={setSorting}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          globalFilter={''}
          globalFilterFn={() => true}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentBudget !== null && (
        <CustomAlertDialog
          title='Eliminar presupuesto'
          description={`¿Estás seguro de querer eliminar el presupuesto "${currentBudget.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentBudget(null);
          }}
        />
      )}
    </>
  );
};

export { BudgetsPage };

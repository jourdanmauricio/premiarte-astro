import { toast } from 'sonner';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import type { Order } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import type { SortingState } from '@tanstack/react-table';
import { budgetsService } from '@/lib/services/budgetsService';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import { getOrderColumns } from '@/components/dashboard/orders/table/orderColumns';
import { ordersService } from '@/lib/services';

const OrdersPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersService.getOrders();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (budgetId: number) => budgetsService.deleteBudget(budgetId),
    onError: (err) => {
      console.error('Error al eliminar el pedido:', err);
      toast.error('Error al eliminar el pedido');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentOrder(null);
    },
  });

  const handleConfirmDelete = useCallback(() => {
    if (currentOrder !== null) {
      deleteMutation.mutate(currentOrder.id);
    }
  }, [currentOrder]);

  const handleDownloadTemplate = () => {
    if (!data || data.length === 0) {
      toast.error('No hay pedidos para descargar');
      return;
    }
  };

  const handleAddOrder = () => {
    navigate('/dashboard/orders/new');
  };

  const handleDeleteOrder = useCallback((order: Order) => {
    setCurrentOrder(order);
    setDeleteModalIsOpen(true);
  }, []);

  const handleEditOrder = useCallback((order: Order) => {
    setCurrentOrder(order);
    navigate(`/dashboard/orders/${order.id}`);
  }, []);

  const columns = useMemo(
    () =>
      getOrderColumns({
        onDelete: handleDeleteOrder,
        onEdit: handleEditOrder,
      }),
    [handleDeleteOrder, handleEditOrder]
  );

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Pedidos
          </h2>

          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={handleDownloadTemplate}>
              <DownloadIcon className='size-5' />
            </Button>
            <Button variant='default' onClick={handleAddOrder}>
              <PlusIcon className='size-5' />
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
      {deleteModalIsOpen && currentOrder !== null && (
        <CustomAlertDialog
          title='Eliminar pedido'
          description={`¿Estás seguro de querer eliminar el pedido "${currentOrder.id}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentOrder(null);
          }}
        />
      )}
    </>
  );
};

export { OrdersPage };

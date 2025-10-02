import { toast } from 'sonner';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Customer } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import type { SortingState } from '@tanstack/react-table';
import { customersService } from '@/lib/services/customersServices';
import { getCustomerColumns } from '@/components/dashboard/customers/table/columns';
import { CustomerModal } from '@/components/dashboard/customers/CustomerModal';

const CustomersPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [customerModalIsOpen, setCustomerModalIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersService.getCustomers();
      return response;
    },
  });

  // console.log('data', data);

  const deleteMutation = useMutation({
    mutationFn: (customerId: number) =>
      customersService.deleteCustomer(customerId),
    onError: (err) => {
      console.error('Error al eliminar cliente:', err);
      toast.error('Error al eliminar el cliente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentCustomer(null);
    },
  });

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    setCurrentCustomer(customer);
    setDeleteModalIsOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => {
    setCurrentCustomer(customer);
    setCustomerModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentCustomer !== null) {
      deleteMutation.mutate(currentCustomer.id);
    }
  }, [currentCustomer]);

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onDelete: handleDeleteCustomer,
        onEdit: handleEditCustomer,
      }),
    [handleDeleteCustomer]
  );

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error('No hay clientes para descargar');
      return;
    }
  };

  const handleAddCustomer = () => {
    setCurrentCustomer(null);
    setCustomerModalIsOpen(true);
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Clientes
          </h2>

          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleDownload}>
              <DownloadIcon className='size-5' />
            </Button>
            <Button variant='default' onClick={handleAddCustomer}>
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
      {deleteModalIsOpen && currentCustomer !== null && (
        <CustomAlertDialog
          title='Eliminar cliente'
          description={`¿Estás seguro de querer eliminar el cliente "${currentCustomer.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentCustomer(null);
          }}
        />
      )}
      {customerModalIsOpen && (
        <CustomerModal
          open={customerModalIsOpen}
          closeModal={() => {
            setCustomerModalIsOpen(false);
            setCurrentCustomer(null);
          }}
          customer={currentCustomer}
        />
      )}
    </>
  );
};

export { CustomersPage };

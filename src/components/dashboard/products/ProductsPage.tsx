import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProductColumns } from '@/components/dashboard/products/table/columns';
import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { productsService } from '@/lib/services/productsService';
import type { Product } from '@/shared/types';

const ProductsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsService.getProducts();
      console.log('Products response:', response);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productsService.deleteProduct(productId),
    onMutate: async (productId) => {
      // Cancelar consultas en curso
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot del estado anterior
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically update
      queryClient.setQueryData(['products'], (old: Product[] | undefined) => {
        return old?.filter((product) => product.id !== productId) || [];
      });

      return { previousProducts };
    },
    onError: (err, productId, context) => {
      // Rollback en caso de error
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }

      console.error('Error al eliminar producto:', err);
      toast.error('Error al eliminar el producto');
    },
    onSuccess: () => {
      toast.success('Producto eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentRow(null);
    },
    onSettled: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const onDelete = useCallback(async (product: Product) => {
    setCurrentRow(product);
    setDeleteModalIsOpen(true);
  }, []);

  const onEdit = useCallback(async (product: Product) => {
    console.log('Editar producto:', product);
    // TODO: Implementar modal de edición
    toast.info('Funcionalidad de edición pendiente de implementar');
  }, []);

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit,
        onDelete,
      }),
    [onEdit, onDelete]
  );

  const handleAddProduct = () => {
    console.log('Agregar producto');
    // TODO: Implementar modal de creación
    toast.info('Funcionalidad de creación pendiente de implementar');
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Lista de productos actualizada');
  };

  const handleConfirmDelete = () => {
    if (currentRow?.id) {
      deleteMutation.mutate(currentRow.id);
    }
  };

  // Filtro global simple - por ahora sin filtros específicos
  const globalFilterFn = () => {
    return true;
  };

  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Gestión de Productos
        </h2>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            onClick={handleRefresh}
            disabled={isLoading}
            title='Actualizar lista'
          >
            <RefreshCwIcon
              className={`size-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button variant='default' onClick={handleAddProduct}>
            <PlusIcon className='size-5 mr-2' />
            Agregar Producto
          </Button>
        </div>
      </div>

      <CustomTable
        data={data || []}
        columns={columns}
        isLoading={isLoading || deleteMutation.isPending}
        globalFilter={{}}
        error={!!error}
        sorting={sorting}
        handleSorting={setSorting}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        globalFilterFn={globalFilterFn}
      />

      {deleteModalIsOpen && (
        <CustomAlertDialog
          title='Eliminar producto'
          description={`¿Estás seguro de querer eliminar el producto "${currentRow?.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText={
            deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'
          }
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            if (!deleteMutation.isPending) {
              setDeleteModalIsOpen(false);
              setCurrentRow(null);
            }
          }}
        />
      )}
    </div>
  );
};

export { ProductsPage };

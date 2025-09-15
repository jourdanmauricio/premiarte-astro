import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCategoryColumns } from '@/components/dashboard/categories/table/columns';
import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { categoriesService } from '@/lib/services/categoriesService';
import type { Category } from '@/shared/types';
import { CategorieModal } from './CategorieModal';

const CategoriesPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [categorieModalIsOpen, setCategorieModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Category | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      console.log('Categories response:', response);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) =>
      categoriesService.deleteCategory(categoryId),
    onMutate: async (categoryId) => {
      // Cancelar consultas en curso
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot del estado anterior
      const previousCategories = queryClient.getQueryData(['categories']);

      // Optimistically update
      queryClient.setQueryData(
        ['categories'],
        (old: Category[] | undefined) => {
          return old?.filter((category) => category.id !== categoryId) || [];
        }
      );

      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      // Rollback en caso de error
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }

      console.error('Error al eliminar categoría:', err);
      toast.error('Error al eliminar la categoría');
    },
    onSuccess: () => {
      toast.success('Categoría eliminada exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentRow(null);
    },
    onSettled: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const onDelete = useCallback(async (category: Category) => {
    setCurrentRow(category);
    setDeleteModalIsOpen(true);
  }, []);

  const onEdit = useCallback(async (category: Category) => {
    setCurrentRow(category);
    setCategorieModalIsOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getCategoryColumns({
        onEdit,
        onDelete,
      }),
    [onEdit, onDelete]
  );

  const handleAddCategory = () => {
    setCurrentRow(null);
    setCategorieModalIsOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Lista de categorías actualizada');
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
          Gestión de Categorías
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
          <Button variant='default' onClick={handleAddCategory}>
            <PlusIcon className='size-5 mr-2' />
            Agregar Categoría
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
          title='Eliminar categoría'
          description={`¿Estás seguro de querer eliminar la categoría "${currentRow?.name}"? Esta acción no se puede deshacer.`}
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

      {categorieModalIsOpen && (
        <CategorieModal
          open={categorieModalIsOpen}
          closeModal={() => setCategorieModalIsOpen(false)}
          category={currentRow}
        />
      )}
    </div>
  );
};

export { CategoriesPage };

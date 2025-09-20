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
import type {
  Category,
  Image,
  Product,
  ProductWithDetails,
} from '@/shared/types';
import { ProductModal } from '@/components/dashboard/products/ProductModal';
import { categoriesService } from '@/lib/services';
import { mediaService } from '@/lib/services/mediaService';

const ProductsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [productModalIsOpen, setProductModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const {
    data: imagesData,
    isLoading: isLoadingImages,
    error: errorImages,
  } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await mediaService.getImages();
      console.log('Images response:', response);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      console.log('Categories response:', response);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsService.getProducts();
      console.log('Products response:', response);
      const productsDetail: ProductWithDetails[] = response.map(
        (product: Product) => {
          const categories: Category[] = [];
          const images: Image[] = [];

          product.categories?.forEach((categoryId: number) => {
            const category = categoriesData?.find(
              (category: Category) => category.id === categoryId
            );
            if (category) {
              categories.push(category);
            }
          });
          product.images?.forEach((imageId: number) => {
            const image = imagesData?.find(
              (image: Image) => image.id === imageId
            );
            if (image) {
              images.push(image);
            }
          });
          return { ...product, detCategories: categories, detImages: images };
        }
      );
      return productsDetail;
    },

    refetchOnWindowFocus: false,
    enabled: !!categoriesData && !!imagesData,
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
    setCurrentRow(product);
    setProductModalIsOpen(true);
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
    setCurrentRow(null);
    setProductModalIsOpen(true);
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

      {productModalIsOpen && (
        <ProductModal
          open={productModalIsOpen}
          closeModal={() => setProductModalIsOpen(false)}
          product={currentRow}
        />
      )}
    </div>
  );
};

export { ProductsPage };

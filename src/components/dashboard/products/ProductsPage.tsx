import { PlusIcon, DownloadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { ProductModal } from '@/components/dashboard/products/modal/ProductModal';
import { SearchInput } from '@/components/ui/custom/SearchInput';
import useProductsPage from '@/components/dashboard/products/useProductsPage';

const ProductsPage = () => {
  const {
    data,
    error,
    isLoading,
    deleteMutation,
    columns,
    sorting,
    pageIndex,
    productModalIsOpen,
    deleteModalIsOpen,
    currentRow,
    globalFilter,
    setPageIndex,
    globalFilterFn,
    handleSearch,
    handleDownloadTemplate,
    handleAddProduct,
    handleSorting,
    handleConfirmDelete,
    setDeleteModalIsOpen,
    setProductModalIsOpen,
    setCurrentRow,
  } = useProductsPage();

  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <h2 className='text-2xl font-bold text-gray-900'>Gestión de Productos</h2>

      <div className='flex items-center justify-between gap-2 mt-6'>
        <SearchInput
          className='w-1/3'
          placeholder='Buscar producto'
          value={globalFilter}
          onChange={handleSearch}
        />

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleDownloadTemplate}>
            <DownloadIcon className='size-5 mr-2' />
            Descargar Productos
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
        globalFilter={globalFilter}
        error={!!error}
        sorting={sorting}
        handleSorting={handleSorting}
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

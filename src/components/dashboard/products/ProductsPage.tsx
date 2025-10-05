import { PlusIcon, DownloadIcon, DollarSignIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { ProductModal } from '@/components/dashboard/products/modals/ProductModal';
import useProductsPage from '@/components/dashboard/products/useProductsPage';
import { UpdatePriceModal } from '@/components/dashboard/products/modals/UpdatePriceModal';
import { FilterProducts } from '@/components/dashboard/products/table/FilterProducts';

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
    rowSelection,
    updatePriceModalIsOpen,
    setUpdatePriceModalIsOpen,
    setRowSelection,
    handlePriceUpdate,
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
        <FilterProducts
          globalFilter={globalFilter}
          handleSearch={handleSearch}
        />

        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={handlePriceUpdate}>
            <DollarSignIcon className='size-5' />
          </Button>
          <Button variant='outline' onClick={handleDownloadTemplate}>
            <DownloadIcon className='size-5' />
          </Button>
          <Button variant='default' onClick={handleAddProduct}>
            <PlusIcon className='size-5' />
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
        setRowSelection={setRowSelection}
        rowSelection={rowSelection}
        getRowId={(row) => row.id.toString()}
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

      {updatePriceModalIsOpen && (
        <UpdatePriceModal
          open={updatePriceModalIsOpen}
          closeModal={() => setUpdatePriceModalIsOpen(false)}
          products={Object.keys(rowSelection).filter(
            (key) => rowSelection[key]
          )}
        />
      )}
    </div>
  );
};

export { ProductsPage };

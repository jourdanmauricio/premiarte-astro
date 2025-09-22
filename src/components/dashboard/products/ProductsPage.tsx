import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import { PlusIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProductColumns } from '@/components/dashboard/products/table/columns';
import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { productsService } from '@/lib/services/productsService';
import type { Product, ProductWithDetails } from '@/shared/types';
import { ProductModal } from '@/components/dashboard/products/ProductModal';
import { UploadResultsModal } from '@/components/dashboard/products/UploadResultsModal';
import { categoriesService } from '@/lib/services';
import { mediaService } from '@/lib/services/mediaService';
import * as XLSX from 'xlsx';

const ProductsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [productModalIsOpen, setProductModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Product | null>(null);
  const [uploadModalIsOpen, setUploadModalIsOpen] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    created: number;
    updated: number;
    errors: number;
    errorDetails: string[];
  } | null>(null);

  const queryClient = useQueryClient();

  // Solo necesitamos obtener productos - ya vienen con categorías e imágenes completas
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsService.getProducts();
      return response;
    },
    refetchOnWindowFocus: false,
  });

  // Los datos ya vienen completos del backend, solo necesitamos mapearlos al tipo esperado
  const data = useMemo(() => {
    if (!productsData) return [];

    const productsDetail: ProductWithDetails[] = productsData.map(
      (product: any) => ({
        ...product,
        detCategories: product.categories || [], // Ya vienen completas del backend
        detImages: product.images || [], // Ya vienen completas del backend
      })
    );
    return productsDetail;
  }, [productsData]);

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
      // Refetch para asegurar sincronización de todas las consultas
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['images'] }),
      ]);
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

  const handleUploadExcel = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el archivo');
      }

      setUploadResults(result);
      setUploadModalIsOpen(true);

      // Refrescar todas las consultas para mantener selectores actualizados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['images'] }),
      ]);

      toast.success('Archivo procesado exitosamente');
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      toast.error('Error al procesar el archivo Excel');
    }

    // Limpiar el input
    event.target.value = '';
  };

  const handleDownloadTemplate = () => {
    if (!data || data.length === 0) {
      toast.error('No hay productos para descargar');
      return;
    }

    try {
      // Preparar datos para Excel (solo campos simples, sin categorías, imágenes ni descuentos)
      const excelData = data.map((product) => ({
        SKU: product.sku || '', // Campo obligatorio para identificación
        Nombre: product.name,
        Precio: product.price,
        Descripción: product.description,
        Stock: product.stock,
        Precio_Retail: product.retailPrice,
        Precio_Mayorista: product.wholesalePrice,
        Slug: product.slug,
        Activo: product.isActive ? 'Sí' : 'No',
        Destacado: product.isFeatured ? 'Sí' : 'No',
        Fecha_Actualización_Precio: product.priceUpdatedAt
          ? new Date(product.priceUpdatedAt).toLocaleDateString('es-ES')
          : '',
      }));

      // Solo usar los datos existentes (sin filas vacías adicionales)

      // Crear workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Función para ajustar automáticamente el ancho de las columnas
      const autoFitColumns = (
        worksheet: XLSX.WorkSheet,
        worksheetData: (string | number | null | undefined)[][]
      ) => {
        const colWidths = worksheetData[0].map((_, colIndex) => {
          const maxWidth = Math.max(
            ...worksheetData.map((row) => {
              const cell = row[colIndex];
              return cell ? cell.toString().length + 2 : 10;
            })
          );

          // Limitar el ancho máximo de la columna descripción (triple del tamaño anterior)
          if (colIndex === 3) {
            // Columna "Descripción"
            return { wch: Math.min(maxWidth, 150) };
          }

          return { wch: maxWidth };
        });
        worksheet['!cols'] = colWidths;
      };

      // Convertir datos a array 2D para autoFitColumns
      const worksheetData = [
        Object.keys(excelData[0]), // Encabezados
        ...excelData.map((row) => Object.values(row)), // Datos
      ];

      autoFitColumns(ws, worksheetData);

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');

      // Generar archivo y descargar
      const fileName = `productos-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Productos descargados exitosamente');
    } catch (error) {
      console.error('Error al generar archivo:', error);
      toast.error('Error al descargar los productos');
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
          <Button variant='outline' onClick={handleDownloadTemplate}>
            <DownloadIcon className='size-5 mr-2' />
            Descargar Productos
          </Button>
          <div className='relative'>
            <input
              type='file'
              accept='.xlsx,.xls'
              onChange={handleUploadExcel}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              id='excel-upload'
            />
            <Button variant='outline' asChild>
              <label htmlFor='excel-upload' className='cursor-pointer'>
                <UploadIcon className='size-5 mr-2' />
                Cargar Excel
              </label>
            </Button>
          </div>
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

      {uploadModalIsOpen && uploadResults && (
        <UploadResultsModal
          open={uploadModalIsOpen}
          onClose={() => {
            setUploadModalIsOpen(false);
            setUploadResults(null);
          }}
          results={uploadResults}
        />
      )}
    </div>
  );
};

export { ProductsPage };

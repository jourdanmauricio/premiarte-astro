import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProductColumns } from '@/components/dashboard/products/table/columns';
import { productsService } from '@/lib/services/productsService';
import type { Product, ProductWithDetails } from '@/shared/types';

const useProductsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [productModalIsOpen, setProductModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Product | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const queryClient = useQueryClient();

  // Solo necesitamos obtener productos - ya vienen con categorías e imágenes completas
  const {
    data: productsData,
    isLoading,
    error,
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
  const globalFilterFn = (row: any) => {
    const product = row.original as Product;
    if (globalFilter === '') return true;
    if (product.name.toLowerCase().includes(globalFilter.toLowerCase()))
      return true;
    if (product.sku?.toLowerCase().includes(globalFilter.toLowerCase()))
      return true;
    if (
      product.categories?.some((category) =>
        category.name.toLowerCase().includes(globalFilter.toLowerCase())
      )
    )
      return true;

    return false;
  };

  const handleSorting = (sorting: SortingState) => {
    setSorting(sorting);
    setPageIndex(0);
  };

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPageIndex(0);
  };
  return {
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
  };
};

export default useProductsPage;

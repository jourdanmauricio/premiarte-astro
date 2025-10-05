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
  const [globalFilter, setGlobalFilter] = useState<{
    search: string;
    category: string;
  }>({ search: '', category: '' });
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [updatePriceModalIsOpen, setUpdatePriceModalIsOpen] = useState(false);

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
  // console.log('productsData', productsData);

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
        Precio_Mayorista: product.wholesalePrice,
        Descripción: product.description,
        Stock: product.stock,
        Precio_Retail: product.retailPrice,
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
      toast.error('Error al descargar los productos');
    }
  };

  // Filtro global simple - por ahora sin filtros específicos
  const globalFilterFn = (row: any) => {
    const product = row.original as Product;
    if (Object.keys(globalFilter).length === 0) return true;

    if (Object.values(globalFilter).every((value) => value === '')) return true;

    // Evaluar todas las condiciones y que todas se cumplan
    let matchesCategory = true;
    let matchesSearch = true;

    // Si hay filtro de categoría, verificar que coincida
    if (globalFilter.category && globalFilter.category !== '') {
      matchesCategory =
        product.categories?.some(
          (category) => category.id === Number(globalFilter.category)
        ) || false;
    }

    // Si hay filtro de búsqueda, verificar que coincida en nombre o SKU
    if (globalFilter.search && globalFilter.search !== '') {
      const searchTerm = globalFilter.search.toLowerCase();
      matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm) ||
        false;
    }

    // Solo retorna true si ambas condiciones se cumplen
    return matchesCategory && matchesSearch;
  };

  const handlePriceUpdate = () => {
    // Ahora rowSelection contiene los IDs de los productos seleccionados
    const selectedProductIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );
    console.log('Productos seleccionados (IDs):', selectedProductIds);

    if (selectedProductIds.length === 0) {
      toast.error('No hay productos seleccionados para actualizar precios');
      return;
    }

    setUpdatePriceModalIsOpen(true);

    // Aquí puedes hacer lo que necesites con los IDs de los productos
    // Por ejemplo, actualizar precios, exportar, etc.
  };

  const handleSorting = (sorting: SortingState) => {
    setSorting(sorting);
    setPageIndex(0);
  };

  const handleSearch = useCallback((key: string, value: string) => {
    setGlobalFilter((prev) => ({ ...prev, [key]: value }));
    setPageIndex(0);
    setRowSelection({});
  }, []);

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
    rowSelection,
    updatePriceModalIsOpen,
    setRowSelection,
    setUpdatePriceModalIsOpen,
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
    handlePriceUpdate,
  };
};

export default useProductsPage;

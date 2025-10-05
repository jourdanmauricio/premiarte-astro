import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCategoryColumns } from '@/components/dashboard/categories/table/columns';
import { categoriesService } from '@/lib/services/categoriesService';
import type { Category } from '@/shared/types';

const useCategoriesPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [categorieModalIsOpen, setCategorieModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Category | null>(null);
  const [globalFilter, setGlobalFilter] = useState<{ search: string }>({
    search: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
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
  const globalFilterFn = (row: any) => {
    const category = row.original as Category;
    if (Object.keys(globalFilter).length === 0) return true;

    if (Object.values(globalFilter).every((value) => value === '')) return true;

    // Evaluar todas las condiciones y que todas se cumplan
    let matchesSearch = true;

    // Si hay filtro de categoría, verificar que coincida
    if (globalFilter.search && globalFilter.search !== '') {
      matchesSearch =
        category.name
          .toLowerCase()
          .includes(globalFilter.search.toLowerCase()) ||
        category.description
          .toLowerCase()
          .includes(globalFilter.search.toLowerCase()) ||
        false;
    }

    // Si hay filtro de búsqueda, verificar que coincida en nombre o SKU

    const searchTerm = globalFilter.search.toLowerCase();
    matchesSearch =
      category.name.toLowerCase().includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm) ||
      false;

    // Solo retorna true si ambas condiciones se cumplen
    return matchesSearch;
  };

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error('No hay categorías para descargar');
      return;
    }

    try {
      // Preparar datos para Excel (solo campos simples, sin categorías, imágenes ni descuentos)
      const excelData = data.map((category) => ({
        Id: category.id,
        Nombre: category.name,
        Destacado: category.featured ? 'Sí' : 'No',
        Descripción: category.description,
        Slug: category.slug,
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
      XLSX.utils.book_append_sheet(wb, ws, 'Categorías');

      // Generar archivo y descargar
      const fileName = `categorias-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Productos descargados exitosamente');
    } catch (error) {
      toast.error('Error al descargar los productos');
    }
  };

  const handleSearch = (key: string, value: string) => {
    setGlobalFilter({ search: value });
    setPageIndex(0);
  };

  return {
    sorting,
    pageIndex,
    deleteModalIsOpen,
    categorieModalIsOpen,
    currentRow,
    data,
    error,
    isLoading,
    deleteMutation,
    columns,
    globalFilter,
    handleSearch,
    globalFilterFn,
    setSorting,
    setPageIndex,
    setDeleteModalIsOpen,
    setCurrentRow,
    setCategorieModalIsOpen,
    handleAddCategory,
    handleRefresh,
    handleConfirmDelete,
    handleDownload,
  };
};

export { useCategoriesPage };

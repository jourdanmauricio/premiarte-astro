import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Budget, CreateOrderData } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import type { SortingState } from '@tanstack/react-table';
import { budgetsService } from '@/lib/services/budgetsService';
import { getBudgetColumns } from '@/components/dashboard/budgets/table/budgetColumns';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import { PdfModal } from '@/components/dashboard/budgets/pdf/PdfModal';
import { ordersService } from '@/lib/services';
import CustomConfirmDialog from '@/components/ui/custom/custom-confirm-dialog';

const BudgetsPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [addOrderModalIsOpen, setAddOrderModalIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await budgetsService.getBudgets();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (budgetId: number) => budgetsService.deleteBudget(budgetId),
    onError: (err) => {
      console.error('Error al eliminar presupuesto:', err);
      toast.error('Error al eliminar el presupuesto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentBudget(null);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({
      order,
      budgetId,
    }: {
      order: CreateOrderData;
      budgetId: number;
    }) => {
      await ordersService.createOrder(order);
      const budget = await budgetsService.updateBudget(budgetId, {
        status: 'approved',
      });
      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Pedido creado exitosamente');
      setCurrentBudget(null);
      setAddOrderModalIsOpen(false);
      navigate('/dashboard/orders');
    },
    onError: (err) => {
      console.error('Error al crear el pedido:', err);
      toast.error('Error al crear el pedido');
    },
  });

  const handleDeleteBudget = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    setDeleteModalIsOpen(true);
  }, []);

  const handleEditBudget = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    navigate(`/dashboard/budgets/${budget.id}`);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentBudget !== null) {
      deleteMutation.mutate(currentBudget.id);
    }
  }, [currentBudget]);

  const handleViewBudget = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    setViewModalIsOpen(true);
  }, []);

  const handleConfirmAddOrder = useCallback(
    (budget: Budget) => {
      setCurrentBudget(budget);
      setAddOrderModalIsOpen(true);
    },
    [currentBudget]
  );

  const handleAddOrder = useCallback(async (budget: Budget) => {
    try {
      const budgetDb = await budgetsService.getBudgetById(budget.id);

      const newOrder = {
        customerId: budgetDb.customerId,
        type: budgetDb.type,
        status: budgetDb.status,
        totalAmount: budgetDb.totalAmount,
        observation: budgetDb.observation,
        items: budgetDb.items || [],
      };

      await createOrderMutation.mutateAsync({
        order: newOrder,
        budgetId: budget.id,
      });
    } catch (error) {
      console.error('Error en handleAddOrder:', error);
      // El error ya se maneja en onError de la mutación
    }
  }, []);

  const columns = useMemo(
    () =>
      getBudgetColumns({
        onDelete: handleDeleteBudget,
        onEdit: handleEditBudget,
        onView: handleViewBudget,
        onCreateOrder: handleConfirmAddOrder,
      }),
    [
      handleDeleteBudget,
      handleEditBudget,
      handleViewBudget,
      handleConfirmAddOrder,
    ]
  );

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error('No hay presupuestos para descargar');
      return;
    }

    try {
      // Preparar datos para Excel (solo campos simples, sin categorías, imágenes ni descuentos)
      const excelData = data.map((budget) => ({
        Id: budget.id,
        Nombre: budget.name,
        Email: budget.email,
        Telefono: budget.phone,
        Tipo: budget.type === 'wholesale' ? 'Mayorista' : 'Minorista',
        Total: budget.totalAmount,
        Status: budget.status,
        CreatedAt: budget.createdAt
          ? new Date(budget.createdAt).toLocaleDateString()
          : '',
        Observacion: budget.observation,
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
          if (colIndex === 8) {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Presupuestos');

      // Generar archivo y descargar
      const fileName = `presupuestos-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Presupuestos descargados exitosamente');
    } catch (error) {
      toast.error('Error al descargar los presupuestos');
    }
  };

  const handleAddBudget = () => {
    navigate('/dashboard/budgets/new');
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Presupuestos
          </h2>

          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={handleDownload}>
              <DownloadIcon className='size-5' />
            </Button>
            <Button variant='default' onClick={handleAddBudget}>
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
      {deleteModalIsOpen && currentBudget !== null && (
        <CustomAlertDialog
          title='Eliminar presupuesto'
          description={`¿Estás seguro de querer eliminar el presupuesto "${currentBudget.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentBudget(null);
          }}
        />
      )}

      {viewModalIsOpen && currentBudget !== null && (
        <PdfModal
          open={viewModalIsOpen}
          budget={currentBudget}
          closeModal={() => {
            setViewModalIsOpen(false);
            setCurrentBudget(null);
          }}
        />
      )}

      {addOrderModalIsOpen && currentBudget !== null && (
        <CustomConfirmDialog
          open={addOrderModalIsOpen}
          onCloseDialog={() => setAddOrderModalIsOpen(false)}
          onContinueClick={() => handleAddOrder(currentBudget)}
          onCancelClick={() => setAddOrderModalIsOpen(false)}
          description={
            <span>
              ¿Estás seguro de querer crear un pedido para el presupuesto "
              {currentBudget.name}"?
            </span>
          }
          cancelButtonText='Cancelar'
          continueButtonText={
            createOrderMutation.isPending ? 'Creando...' : 'Crear pedido'
          }
          isLoading={createOrderMutation.isPending}
        />
      )}
    </>
  );
};

export { BudgetsPage };

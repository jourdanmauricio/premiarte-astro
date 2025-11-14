import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Customer } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import type { SortingState } from '@tanstack/react-table';
import { customersService } from '@/lib/services/customersServices';
import { getCustomerColumns } from '@/components/dashboard/customers/table/columns';
import { CustomerModal } from '@/components/dashboard/customers/CustomerModal';
import CustomerFilter from '@/components/dashboard/customers/table/CustomerFilter';

const CustomersPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [customerModalIsOpen, setCustomerModalIsOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<{
    search: string;
    type: string;
  }>({ search: '', type: '' });


  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersService.getCustomers();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (customerId: number) =>
      customersService.deleteCustomer(customerId),
    onError: (err) => {
      console.error('Error al eliminar cliente:', err);
      toast.error('Error al eliminar el cliente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentCustomer(null);
    },
  });

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    setCurrentCustomer(customer);
    setDeleteModalIsOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => {
    setCurrentCustomer(customer);
    setCustomerModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentCustomer !== null) {
      deleteMutation.mutate(currentCustomer.id);
    }
  }, [currentCustomer]);

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onDelete: handleDeleteCustomer,
        onEdit: handleEditCustomer,
      }),
    [handleDeleteCustomer]
  );

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error('No hay clientes para descargar');
      return;
    }
    try {
      // Preparar datos para Excel (solo campos simples, sin categorías, imágenes ni descuentos)
      const excelData = data.map((customer) => ({
        Id: customer.id,
        Nombre: customer.name,
        Email: customer.email,
        Telefono: customer.phone,
        Documento: customer.document,
        Tipo: customer.type == 'wholesale' ? 'Mayorista' : 'Minorista',
        Direccion: customer.address,
        Observacion: customer.observation,
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
          if (colIndex === 7) {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

      // Generar archivo y descargar
      const fileName = `clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Clientes descargados exitosamente');
    } catch (error) {
      toast.error('Error al descargar los clientes');
    }
  };

  const handleAddCustomer = () => {
    setCurrentCustomer(null);
    setCustomerModalIsOpen(true);
  };

  const globalFilterFn = (row: any) => {
    const customer = row.original as Customer;
    if (Object.keys(globalFilter).length === 0) return true;

    if (Object.values(globalFilter).every((value) => value === '')) return true;

    // Evaluar todas las condiciones y que todas se cumplan
    let matchesType = true;
    let matchesSearch = true;

    // Si hay filtro de categoría, verificar que coincida
    if (globalFilter.type && globalFilter.type !== '') {
      matchesType =
        customer.type === globalFilter.type;
    }

    // Si hay filtro de búsqueda, verificar que coincida en nombre o SKU
    if (globalFilter.search && globalFilter.search !== '') {
      const searchTerm = globalFilter.search.toLowerCase();
      matchesSearch =
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.document?.toLowerCase().includes(searchTerm) ||  
        false;
    }

    // Solo retorna true si ambas condiciones se cumplen
    return matchesType && matchesSearch;
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Clientes
          </h2>

          <div className='flex items-center gap-4'>
            <CustomerFilter
              globalFilter={globalFilter}
              handleSearch={(key: string, value: string) => setGlobalFilter({ ...globalFilter, [key]: value })}
            />
            <Button variant='outline' onClick={handleDownload}>
              <DownloadIcon className='size-5' />
            </Button>
            <Button variant='default' onClick={handleAddCustomer}>
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
          globalFilter={globalFilter}
          globalFilterFn={globalFilterFn}
        />  
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentCustomer !== null && (
        <CustomAlertDialog
          title='Eliminar cliente'
          description={`¿Estás seguro de querer eliminar el cliente "${currentCustomer.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentCustomer(null);
          }}
        />
      )}
      {customerModalIsOpen && (
        <CustomerModal
          open={customerModalIsOpen}
          closeModal={() => {
            setCustomerModalIsOpen(false);
            setCurrentCustomer(null);
          }}
          customer={currentCustomer}
        />
      )}
    </>
  );
};

export { CustomersPage };

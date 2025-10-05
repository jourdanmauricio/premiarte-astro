import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DownloadIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { newsletterService } from '@/lib/services';
import type { NewsletterSubscriber } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { getNewsletterColumns } from '@/components/dashboard/newsletter/table/newsletterColumns';

const NewsletterPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentNewsletter, setCurrentNewsletter] =
    useState<NewsletterSubscriber | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['newsletter'],
    queryFn: async () => {
      const response = await newsletterService.getNewsletter();
      return response;
    },
  });

  console.log('data', data);

  const deleteMutation = useMutation({
    mutationFn: (newsletterId: number) =>
      newsletterService.deleteNewsletter(newsletterId),
    onError: (err) => {
      console.error('Error al eliminar newsletter:', err);
      toast.error('Error al eliminar el suscriptor');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
      toast.success('Suscriptor eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentNewsletter(null);
    },
  });

  const handleDeleteNewsletter = useCallback(
    (newsletter: NewsletterSubscriber) => {
      setCurrentNewsletter(newsletter);
      setDeleteModalIsOpen(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (currentNewsletter !== null) {
      deleteMutation.mutate(currentNewsletter.id);
    }
  }, [currentNewsletter]);

  const columns = useMemo(
    () =>
      getNewsletterColumns({
        onDelete: handleDeleteNewsletter,
      }),
    [handleDeleteNewsletter]
  );

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast.error('No hay newsletter para descargar');
      return;
    }
    try {
      const excelData = data.map((newsletter) => ({
        Id: newsletter.id,
        Nombre: newsletter.name,
        Email: newsletter.email,
        Activo: newsletter.isActive ? 'Sí' : 'No',
        Fecha_Suscripcion: newsletter.subscribedAt
          ? new Date(newsletter.subscribedAt).toLocaleDateString()
          : '',
      }));

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
      XLSX.utils.book_append_sheet(wb, ws, 'Newsletter');

      // Generar archivo y descargar
      const fileName = `newsletter-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Newsletter descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el newsletter');
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Newsletter
          </h2>

          <Button variant='outline' onClick={handleDownload}>
            <DownloadIcon className='size-5' />
          </Button>
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
          globalFilter={{}}
          globalFilterFn={() => true}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentNewsletter !== null && (
        <CustomAlertDialog
          title='Eliminar testimonio'
          description={`¿Estás seguro de querer eliminar el testimonio "${currentNewsletter.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentNewsletter(null);
          }}
        />
      )}
    </>
  );
};

export { NewsletterPage };

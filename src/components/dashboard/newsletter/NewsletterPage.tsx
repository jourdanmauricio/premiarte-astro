import { toast } from 'sonner';
import { DownloadIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { categoriesService, newsletterService } from '@/lib/services';
import type { Category, NewsletterSubscriber } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { getNewsletterColumns } from '@/components/dashboard/newsletter/table/newsletterColumns';
import type { SortingState } from '@tanstack/react-table';

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

  const handleDownloadTemplate = () => {
    if (!data || data.length === 0) {
      toast.error('No hay newsletter para descargar');
      return;
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Newsletter
          </h2>

          <Button variant='outline' onClick={handleDownloadTemplate}>
            <DownloadIcon className='size-5 mr-2' />
            Descargar Newsletter
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

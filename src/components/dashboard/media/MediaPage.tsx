import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import { FolderSyncIcon, PlusIcon } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ImageModal } from '@/components/dashboard/media/ImageModal';
import { getMediaColumns } from '@/components/dashboard/media/table/columns';
import { FilterImages } from '@/components/dashboard/media/table/FilterImages';
import { Button } from '@/components/ui/button';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { mediaService } from '@/lib/services/mediaService';
import type { Image } from '@/shared/types';

export interface IMediaGlobalFilter {
  tag: string;
}

const MediaPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Image | null>(null);
  const [globalFilter, setGlobalFilter] = useState({
    tag: 'Todas',
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['Images'],
    queryFn: async () => {
      const response = await mediaService.getImages();
      console.log('response', response);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const syncMutation = useMutation({
    mutationFn: () => mediaService.synchronizeImages(),
    onSuccess: (result) => {
      console.log('Sincronización exitosa:', result);
      queryClient.invalidateQueries({ queryKey: ['Images'] });

      toast.success(
        `Sincronización completada: ${result.added} agregadas, ${result.marked} marcadas para eliminar`
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Error al sincronizar imágenes'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => mediaService.deleteImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Images'] });

      toast.success('Imagen eliminada correctamente');

      setDeleteModalIsOpen(false);
      setCurrentRow(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar la imagen'
      );
    },
  });

  const onDelete = useCallback(async (image: Image) => {
    setCurrentRow(image);
    setDeleteModalIsOpen(true);
  }, []);

  const onEdit = useCallback(async (image: Image) => {
    setEditModalIsOpen(true);
    setCurrentRow(image);
  }, []);

  const columns = useMemo(
    () =>
      getMediaColumns({
        onEdit,
        onDelete,
      }),
    []
  );

  const handleAddImage = () => {
    setEditModalIsOpen(true);
    setCurrentRow(null);
  };

  const handleSyncImages = () => {
    syncMutation.mutate();
  };

  const handleConfirmDelete = () => {
    if (currentRow?.id) {
      deleteMutation.mutate(currentRow.id);
    }
  };

  const globalFilterFn = (row: any) => {
    const image = row.original as Image;
    if (globalFilter.tag === 'Todas') return true;
    if (globalFilter.tag === 'Categorías') return image.tag === 'Categorías';
    if (globalFilter.tag === 'Productos') return image.tag === 'Productos';
    if (globalFilter.tag === 'Páginas') return image.tag === 'Páginas';
    if (globalFilter.tag === 'Otros') return image.tag === 'Otros';
    return false;
  };

  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='card-title'>Galería de Imágenes</h2>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            onClick={handleSyncImages}
            disabled={syncMutation.isPending}
            title='Sincronizar con Cloudinary'
          >
            <FolderSyncIcon
              className={`size-5 ${syncMutation.isPending ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button variant='ghost' onClick={handleAddImage}>
            <PlusIcon className='size-5' />
          </Button>
        </div>
      </div>

      <FilterImages
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <CustomTable
        data={data || []}
        columns={columns}
        isLoading={
          isLoading || syncMutation.isPending || deleteMutation.isPending
        }
        globalFilter={globalFilter}
        error={!!error}
        sorting={sorting}
        handleSorting={setSorting}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        globalFilterFn={globalFilterFn}
      />

      {editModalIsOpen && (
        <ImageModal
          open={editModalIsOpen}
          closeModal={() => setEditModalIsOpen(false)}
          image={currentRow}
        />
      )}

      {deleteModalIsOpen && (
        <CustomAlertDialog
          title='Eliminar imagen'
          description='¿Estás seguro de querer eliminar esta imagen? Esta acción no se puede deshacer.'
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
    </div>
  );
};

export { MediaPage };

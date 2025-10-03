import { PlusIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Responsible } from '@/shared/types';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { responsiblesService } from '@/lib/services/responsiblesService';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { ResponsibleModal } from '@/components/dashboard/settings/sections/responsible/ResponsibleModal';
import { getResponsibleColumns } from '@/components/dashboard/settings/sections/responsible/table/columns';

const ResponsiblePanel = () => {
  const [currentResponsible, setCurrentResponsible] =
    useState<Responsible | null>(null);
  const [responsibleModalIsOpen, setResponsibleModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['responsibles'],
    queryFn: async () => {
      const response = await responsiblesService.getResponsibles();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (responsbleId: number) =>
      await responsiblesService.deleteResponsible(responsbleId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['responsibles'] });
      queryClient.invalidateQueries({ queryKey: ['responsibles'] });
      toast.success('Responsable eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentResponsible(null);
    },
    onError: () => {
      toast.error('Error al eliminar el responsable');
    },
  });

  const handleAddResponsible = () => {
    setCurrentResponsible(null);
    setResponsibleModalIsOpen(true);
  };

  const onEdit = useCallback((responsible: Responsible) => {
    setCurrentResponsible(responsible);
    setResponsibleModalIsOpen(true);
  }, []);

  const onDelete = useCallback((responsible: Responsible) => {
    setCurrentResponsible(responsible);
    setDeleteModalIsOpen(true);
  }, []);

  const handleConfirmDeleteResponsible = () => {
    if (currentResponsible?.id) {
      deleteMutation.mutate(currentResponsible.id);
    }
  };

  const columns = useMemo(
    () =>
      getResponsibleColumns({
        onEdit,
        onDelete,
      }),
    [onEdit, onDelete]
  );

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Gestión de Responsables
        </h2>
        <Button variant='default' onClick={handleAddResponsible}>
          <PlusIcon className='size-5' />
        </Button>
      </div>
      <CustomTable
        data={data || []}
        columns={columns}
        isLoading={isLoading || deleteMutation.isPending}
        globalFilter={''}
        error={!!error}
        sorting={[]}
        pageIndex={0}
        globalFilterFn={() => true}
        handleSorting={() => {}}
        setPageIndex={() => {}}
      />

      {responsibleModalIsOpen && (
        <ResponsibleModal
          open={responsibleModalIsOpen}
          closeModal={() => setResponsibleModalIsOpen(false)}
          responsible={currentResponsible}
        />
      )}
      {deleteModalIsOpen && (
        <CustomAlertDialog
          title='Eliminar responsable'
          description={`¿Estás seguro de querer eliminar el responsable "${currentResponsible?.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText={
            deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'
          }
          onContinueClick={handleConfirmDeleteResponsible}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            if (!deleteMutation.isPending) {
              setDeleteModalIsOpen(false);
              setCurrentResponsible(null);
            }
          }}
        />
      )}
    </div>
  );
};

export { ResponsiblePanel };

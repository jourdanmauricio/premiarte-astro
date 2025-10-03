import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Responsible } from '@/shared/types';
import { ResponsibleFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import SubmitButton from '@/components/ui/custom/submit-button';
import { responsiblesService } from '@/lib/services/responsiblesService';

interface ResponsibleModalProps {
  open: boolean;
  closeModal: () => void;
  responsible: Responsible | null;
}

type ResponsibleFormData = z.infer<typeof ResponsibleFormSchema>;

const defaultValues = {
  name: '',
  cuit: '',
  condition: '',
  observation: '',
};

const ResponsibleModal = ({
  open,
  closeModal,
  responsible,
}: ResponsibleModalProps) => {
  const mode = responsible ? 'EDIT' : 'CREATE';

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof ResponsibleFormSchema>>({
    resolver: zodResolver(ResponsibleFormSchema),
    defaultValues: responsible
      ? { ...responsible, observation: responsible.observation || '' }
      : defaultValues,
  });

  const onSubmit = (data: ResponsibleFormData) => {
    responsibleMutation.mutate(data);
  };

  const onError = () => {
    console.log(form.formState.errors);
  };

  const responsibleMutation = useMutation({
    mutationFn: async (data: ResponsibleFormData) => {
      if (mode === 'EDIT' && responsible?.id) {
        await responsiblesService.updateResponsible(responsible.id, data);
      } else {
        await responsiblesService.createResponsible(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsibles'] });
      toast.success(
        mode === 'CREATE'
          ? 'Responsable creado correctamente'
          : 'Responsable actualizado correctamente'
      );
      closeModal();
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al guardar el responsable'
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-h-[95%] max-w-2xl overflow-y-auto w-full'>
        <DialogHeader>
          <DialogTitle className='dialog-title'>
            {mode === 'CREATE' ? 'Nuevo responsable' : 'Editar responsable'}
          </DialogTitle>
          <DialogDescription />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className='mt-4 flex flex-col gap-6 w-full'
            >
              <InputField
                label='Nombre'
                name='name'
                placeholder='Nombre del responsable'
                form={form}
              />
              <InputField
                label='CUIT'
                name='cuit'
                placeholder='CUIT'
                form={form}
              />
              <InputField
                label='Condición'
                name='condition'
                placeholder='Condición'
                form={form}
              />

              <InputField
                label='Observación'
                name='observation'
                placeholder='Observación'
                form={form}
              />

              <div className='flex justify-end gap-8 pt-10'>
                <Button
                  type='button'
                  onClick={closeModal}
                  variant='outline'
                  className='min-w-[150px]'
                >
                  Cancelar
                </Button>
                <SubmitButton
                  label={mode === 'CREATE' ? 'Crear responsable' : 'Guardar'}
                  className='min-w-[150px]'
                  showSpinner={responsibleMutation.isPending}
                  disabled={
                    responsibleMutation.isPending || !form.formState.isDirty
                  }
                />
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { ResponsibleModal };

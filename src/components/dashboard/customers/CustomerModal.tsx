import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/lib/services/categoriesService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Customer } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import InputField from '@/components/ui/custom/input-field';
import { customersService } from '@/lib/services/customersServices';
import Dropdown from '@/components/ui/custom/dropdown';
import { customerTypeList } from '@/shared/consts';
import { CustomerFormSchema } from '@/shared/schemas';

interface CategorieModalProps {
  open: boolean;
  closeModal: () => void;
  customer: Customer | null;
}

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  type: 'retail' as 'wholesale' | 'retail',
  document: '',
  address: '',
  observation: '',
};

const CustomerModal = ({ open, closeModal, customer }: CategorieModalProps) => {
  const mode = customer ? 'EDIT' : 'CREATE';
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof CustomerFormSchema>>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues:
      mode === 'EDIT' && customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            type: customer.type,
            document: customer.document || '',
            address: customer.address || '',
            observation: customer.observation || '',
          }
        : defaultValues,
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof CustomerFormSchema>) => {
      if (mode === 'EDIT' && customer?.id) {
        return customersService.updateCustomer(customer.id, data);
      } else {
        return customersService.createCustomer(data);
      }
    },
    onSuccess: async () => {
      // Invalidar y refrescar inmediatamente
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(
        mode === 'CREATE'
          ? 'Cliente creado correctamente'
          : 'Cliente actualizado correctamente'
      );
      closeModal();
      form.reset();
    },
    onError: (error) => {
      console.error('Error al guardar el cliente:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el cliente'
      );
    },
  });

  const onSubmit = (data: z.infer<typeof CustomerFormSchema>) => {
    categoryMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-h-[95%] max-w-2xl overflow-y-auto w-full'>
        <DialogHeader>
          <DialogTitle className='dialog-title'>
            {mode === 'CREATE'
              ? 'Nuevo cliente'
              : `Modifiar cliente ${customer?.name}`}
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
                placeholder='Nombre del cliente'
                form={form}
              />
              <InputField
                label='Email'
                name='email'
                placeholder='Email'
                form={form}
              />
              <InputField
                label='Teléfono'
                name='phone'
                placeholder='Teléfono'
                form={form}
              />

              <Dropdown
                label='Tipo'
                name='type'
                placeholder='Tipo'
                form={form}
                list={customerTypeList}
              />
              <InputField
                label='Documento'
                name='document'
                placeholder='Documento'
                form={form}
              />
              <InputField
                label='Dirección'
                name='address'
                placeholder='Dirección'
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
                  label={mode === 'CREATE' ? 'Crear cliente' : 'Guardar'}
                  className='min-w-[150px]'
                  showSpinner={categoryMutation.isPending}
                  disabled={
                    categoryMutation.isPending || !form.formState.isDirty
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

export { CustomerModal };

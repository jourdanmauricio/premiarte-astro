import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Budget } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { BudgetFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { budgetsService } from '@/lib/services/budgetsService';
import { budgetStatusList } from '@/shared/consts';
import Dropdown from '@/components/ui/custom/dropdown';
import TextareaField from '@/components/ui/custom/textarea-field';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import {
  getBudgetItemColumns,
  transformBudgetsToItemRows,
} from './table/budgetItemsColumns';
import InputNumberField from '@/components/ui/custom/input-number-field';
import { CustomDatePicker } from '@/components/ui/custom/custom-date-picker';

const defaultValues = {
  name: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'pending',
  observation: '',
  totalAmount: 0,
  items: [],
};

const BudgetForm = () => {
  const { id } = useParams();
  const mode = id === 'new' ? 'CREATE' : 'EDIT';
  const queryClient = useQueryClient();

  const { data: budget } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsService.getBudgetById(parseInt(id!)),
    enabled: !!id && mode === 'EDIT',
  });

  const form = useForm<z.infer<typeof BudgetFormSchema>>({
    resolver: zodResolver(BudgetFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'EDIT' && budget) {
      const budgetData = {
        ...budget,
        observation: budget.observation ?? '',
        createdAt: budget.createdAt ? new Date(budget.createdAt) : undefined,
      };
      form.reset(budgetData);
    }
  }, [mode, budget]);

  //   const budgetMutation = useMutation({
  //     mutationFn: async (data: z.infer<typeof BudgetFormSchema>) => {
  //       const budgetData = {
  //         ...data,
  //         observation: data.observation || '',
  //       };

  //       if (mode === 'EDIT' && budget?.id) {
  //         return budgetsService.updateBudget(budget.id, budgetData);
  //       } else {
  //         return budgetsService.createBudget(budgetData);
  //       }
  //     },
  //     onSuccess: async () => {
  //       // Invalidar y refrescar inmediatamente
  //       await queryClient.invalidateQueries({ queryKey: ['budgets'] });
  //       toast.success(
  //         mode === 'CREATE'
  //           ? 'Presupuesto creado correctamente'
  //           : 'Presupuesto actualizado correctamente'
  //       );
  //       navigate('/dashboard/budgets');
  //     },
  //     onError: (error) => {
  //       console.error('Error al guardar el presupuesto:', error);
  //       toast.error(
  //         error instanceof Error
  //           ? error.message
  //           : 'Error al guardar el presupuesto'
  //       );
  //     },
  //   });

  const onSubmit = (data: z.infer<typeof BudgetFormSchema>) => {
    console.log('data', data);
    // budgetMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  // Funciones para manejar la tabla de items
  const handleDeleteBudget = (budget: Budget) => {
    console.log('Eliminar presupuesto:', budget);
    // Aquí implementarías la lógica de eliminación
  };

  const handleEditBudget = (budget: Budget) => {
    console.log('Editar presupuesto:', budget);
    // Aquí implementarías la lógica de edición
  };

  // Transformar los datos para la tabla de items
  const itemRows = useMemo(() => {
    if (!budget) return [];
    return transformBudgetsToItemRows([budget]);
  }, [budget]);

  // Columnas de la tabla de items
  const itemColumns = useMemo(
    () =>
      getBudgetItemColumns({
        onDelete: handleDeleteBudget,
        onEdit: handleEditBudget,
      }),
    [handleDeleteBudget, handleEditBudget]
  );

  console.log('form.formState.errors', form.formState.errors);
  console.log('form', form.getValues());
  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <h2 className='text-2xl font-bold text-gray-900'>
        {mode === 'CREATE' ? 'Nuevo presupuesto' : 'Editar presupuesto'}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className='grid grid-cols-2 gap-6 w-full'
        >
          <InputField
            label='Nombre'
            name='name'
            placeholder='Nombre'
            form={form}
          />
          <InputField
            label='Apellido'
            name='lastName'
            placeholder='Apellido'
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
            label='Estado'
            name='status'
            placeholder='Estado'
            form={form}
            list={budgetStatusList}
          />

          <div></div>

          <TextareaField
            label='Observación'
            name='observation'
            placeholder='Observación'
            form={form}
            className='col-span-2'
          />

          <p className='text-sm text-red-500'>
            Pendiente: Selector precios mayorista o minorista
          </p>

          <p className='text-sm text-red-500'>
            Pendiente: aplicar descuento conf x prod
          </p>

          <CustomDatePicker
            className='w-full'
            label='Fecha de creación'
            name='createdAt'
            form={form}
            labelClassName='w-full'
            // disabled={(date) => date >= new Date()}
            readOnly={true}
          />

          <CustomDatePicker
            className='w-full'
            label='Fecha de expiración'
            name='expiresAt'
            form={form}
            labelClassName='w-full'
            disabled={(date) => date <= new Date()}
          />

          <InputNumberField
            label='Total'
            name='totalAmount'
            placeholder='Total'
            form={form}
            integerDigits={0}
            decimalDigits={2}
          />

          {/* Tabla de items del presupuesto */}
          {mode === 'EDIT' &&
            budget &&
            budget.items &&
            budget.items.length > 0 && (
              <div className='col-span-2 mt-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Items del Presupuesto
                </h3>
                <CustomTable
                  data={itemRows}
                  columns={itemColumns}
                  isLoading={false}
                  error={false}
                  sorting={[]}
                  handleSorting={() => {}}
                  pageIndex={0}
                  setPageIndex={() => {}}
                  globalFilter={{}}
                  globalFilterFn={() => true}
                />
              </div>
            )}

          <div className='flex justify-end gap-8 pt-10 col-span-2'>
            <Button
              type='button'
              onClick={() => navigate('/dashboard/budgets')}
              variant='outline'
              className='min-w-[150px]'
            >
              Cancelar
            </Button>
            <SubmitButton
              label={mode === 'CREATE' ? 'Crear categoría' : 'Guardar'}
              className='min-w-[150px]'
              showSpinner={false}
              disabled={false || !form.formState.isDirty}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export { BudgetForm };

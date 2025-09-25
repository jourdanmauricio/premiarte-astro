import { useQuery } from '@tanstack/react-query';
import { type UseFormReturn, useFormContext } from 'react-hook-form';

import { getColumns } from './columns';
import { categoriesService } from '@/lib/services';
import { CategorySelectorTable } from './CategorySelectorTable';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';

type CategorySelectorProps = {
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
};

/**
 * Parámetros Opcionales
 *  - Filter: nomnbre del campo en el schema donde se almacena el estado del filtro
 **/
export default function CategorySelector({
  name,
  form,
  labelClassName,
}: CategorySelectorProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const columns = getColumns();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <CategorySelectorTable
            data={data || []}
            columns={columns}
            isLoading={isLoading}
            form={form}
            nameSchema={name}
            labelClassName={labelClassName}
          />
          <div
            className={`relative transition-all duration-300 ease-in-out ${fieldState.invalid ? 'opacity-100' : 'opacity-0'}`}
          >
            <FormMessage className='absolute -top-1 font-normal' />
          </div>
        </FormItem>
      )}
    />
  );
}

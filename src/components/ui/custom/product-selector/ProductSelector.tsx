import { useEffect } from 'react';
import { type UseFormReturn, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ProductSelectorTable } from './ProductSelectorTable';
import { getColumns } from './columns';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { productsService } from '@/lib/services';

type ProductSelectorProps = {
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
};

/**
 * Parámetros Opcionales
 *  - Filter: nombre del campo en el schema donde se almacena el estado del filtro
 **/
export default function ProductSelector({
  name,
  form,
  className,
  labelClassName,
}: ProductSelectorProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsService.getProducts();
      console.log('Products response:', response);
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
          <ProductSelectorTable
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

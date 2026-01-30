import { ComboboxForm } from '@/components/ui/combobox';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { productsService } from '@/lib/services/productsService';
import type { Product, ProductWithDetails } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';

import { useFormContext, type UseFormReturn } from 'react-hook-form';

type DropdownProps = {
  label: string;
  name: string;
  placeholder: string;
  form: UseFormReturn<any>;
  className?: string;
  onChange?: (value: ProductWithDetails) => void;
  labelClassName?: string;
  disabled?: boolean;
  setDefaultValue?: 'last' | 'first' | null;
  filterIds?: number[];
  queryParams?: {};
};

export default function ProductsCombobox({
  label,
  name,
  placeholder,
  form,
  className,
  onChange,
  labelClassName,
  disabled,
  setDefaultValue,
  filterIds,
  queryParams,
}: DropdownProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const { data, isLoading } = useQuery({
    queryKey: ['productsCombobox'],
    queryFn: async () => {
      const products = await productsService.getProductsWithDetails();
      return products.map((product: Product) => ({
        label: product.name,
        value: product.id,
        fullProduct: product,
      }));
    },
  });

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`${className}`}>
          <FormLabel className={`text-[1rem] font-normal ${labelClassName}`}>
            {label}
          </FormLabel>
          <ComboboxForm
            form={form}
            name={name}
            placeholder={isLoading ? 'Cargando...' : placeholder}
            field={field}
            filters={queryParams}
            data={data || []}
            onChange={(item) => {
              if (onChange && item.fullProduct) {
                onChange(item.fullProduct as ProductWithDetails);
              }
            }}
            isLoading={isLoading}
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

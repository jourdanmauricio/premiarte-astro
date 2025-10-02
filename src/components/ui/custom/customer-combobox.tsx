import { ComboboxForm } from '@/components/ui/combobox';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { customersService } from '@/lib/services/customersServices';
import { productsService } from '@/lib/services/productsService';
import type { Customer, Product } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';

import { useFormContext, type UseFormReturn } from 'react-hook-form';

type DropdownProps = {
  label: string;
  name: string;
  placeholder: string;
  form: UseFormReturn<any>;
  className?: string;
  onChange?: (value: any) => void;
  labelClassName?: string;
  disabled?: boolean;
  setDefaultValue?: 'last' | 'first' | null;
  filterIds?: number[];
  queryParams?: {};
};

export default function CustomersCombobox({
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

  const { data } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersService.getCustomers();
      return response.map((customer: Customer) => ({
        ...customer,
        label: customer.name,
        value: customer.id,
      }));
    },
  });

  console.log('data', data);

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
            placeholder={placeholder}
            field={field}
            filters={queryParams}
            data={data || []}
            onChange={onChange}
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

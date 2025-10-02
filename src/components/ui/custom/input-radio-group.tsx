import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type UseFormReturn } from 'react-hook-form';

type ItemList = {
  id: string;
  description: any;
};

type InputRadioGroupProps = {
  name: string;
  label?: string;
  form: UseFormReturn<any>;
  list: ItemList[];
  className?: string;
  labelClassName?: string;
  radioGrupClassName?: string;
  itemClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
};

export default function InputRadioGroup({
  name,
  label,
  form,
  list,
  orientation,
  className,
  labelClassName,
  radioGrupClassName,
  itemClassName,
  disabled,
}: InputRadioGroupProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`space-y-3 ${className}`}>
          {label && (
            <FormLabel className={`text-base font-semibold ${labelClassName}`}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className={`flex gap-x-8 gap-y-4 ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} ${radioGrupClassName}`}
              disabled={disabled}
            >
              {list.map((item) => (
                <FormItem
                  key={item.id}
                  className='flex items-center gap-x-2 space-y-1'
                >
                  <FormControl>
                    <RadioGroupItem value={item.id} />
                  </FormControl>
                  <FormLabel
                    className={`text-base font-normal ${itemClassName} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {item.description}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

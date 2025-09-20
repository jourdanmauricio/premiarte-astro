import { cn } from '@/lib/utils';
import { useFormContext, type UseFormReturn } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type BooleanCheckboxProps = {
  name: string;
  label: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

export default function BooleanCheckbox({
  label,
  name,
  form,
  className,
  labelClassName,
  errorClassName,
  disabled = false,
  onChange,
}: BooleanCheckboxProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div>
          <FormItem
            className={`flex flex-row items-center space-x-3 space-y-0 p-4 ${className}`}
          >
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={(isChecked: boolean) => {
                  field.onChange(isChecked);
                  if (onChange) {
                    onChange(isChecked);
                  }
                }}
                disabled={disabled}
              />
            </FormControl>
            <div className={`space-y-1 leading-none ${labelClassName}`}>
              <FormLabel
                className={`text-base ${labelClassName} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {label}
              </FormLabel>
            </div>
          </FormItem>
          <div
            className={`relative transition-all duration-300 ease-in-out ${fieldState.invalid ? 'opacity-100' : 'opacity-0'}`}
          >
            <FormMessage
              className={cn('absolute top-1 font-normal', errorClassName)}
            />
          </div>
        </div>
      )}
    />
  );
}

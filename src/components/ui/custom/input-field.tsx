import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'form'> & {
  label: string;
  name: string;
  form: UseFormReturn<any>;
  className?: string; // FormItem className
  labelClassName?: string;
  enableClean?: boolean;
  errorClassName?: string;
};

export default function InputField({
  label,
  name,
  form,
  className,
  labelClassName,
  enableClean,
  errorClassName,
  onChange,
  onFocus,
  onBlur,
  ...inputProps
}: InputFieldProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={`font-normal ${labelClassName}`}>
            {label}
          </FormLabel>
          {enableClean && field.value && (
            <div className='relative w-full'>
              <div
                className='absolute right-3 top-5 -translate-y-1/2 transform cursor-pointer'
                onClick={() => field.onChange('')}
              >
                <X className='h-4 w-4 text-neutral-500' />
              </div>
            </div>
          )}
          <FormControl>
            <Input
              {...inputProps}
              className={cn(
                fieldState.invalid &&
                  'border border-destructive text-destructive placeholder:text-destructive focus-visible:ring-destructive',
                inputProps.readOnly &&
                  'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              tabIndex={inputProps.readOnly ? -1 : 0}
              {...field}
              onChange={(e) => {
                if (onChange) {
                  field.onChange(onChange(e));
                } else {
                  field.onChange(e);
                }
              }}
              onFocus={(e) => {
                field.onBlur();
                if (onFocus) {
                  onFocus(e);
                }
              }}
              onBlur={(e) => {
                field.onBlur();
                if (onBlur) {
                  onBlur(e);
                }
              }}
            />
          </FormControl>
          <div
            className={cn(
              `relative transition-all duration-300 ease-in-out ${fieldState.invalid ? 'opacity-100' : 'opacity-0'}`,
              errorClassName
            )}
          >
            <FormMessage className='absolute top-0 font-normal' />
          </div>
        </FormItem>
      )}
    />
  );
}

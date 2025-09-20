import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type TextareaHTMLAttributes, useEffect, useRef } from 'react';

import { type UseFormReturn, useFormContext } from 'react-hook-form';

type BaseTextareaFieldProps = {
  label: string;
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  inputClassname?: string;
  labelClassName?: string;
  maxLength?: number;
  enableClean?: boolean;
  errorClassName?: string;
  cursorPosition?: number;
};

type TextareaFieldProps = BaseTextareaFieldProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof BaseTextareaFieldProps
  >;

export default function TextareaField({
  label,
  name,
  placeholder,
  labelClassName,
  form,
  maxLength,
  className,
  inputClassname,
  cursorPosition,
  ...props
}: TextareaFieldProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (cursorPosition !== undefined && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={cn('font-normal', labelClassName)}>
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              maxLength={maxLength}
              {...field}
              ref={textareaRef}
              className={cn(
                'resize-none',
                inputClassname,
                fieldState.invalid &&
                  'border border-destructive text-destructive placeholder:text-destructive focus-visible:ring-destructive'
              )}
              {...props}
            />
          </FormControl>

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

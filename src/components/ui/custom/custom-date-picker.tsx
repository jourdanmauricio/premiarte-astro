'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { es } from 'react-day-picker/locale';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type CustomDatePickerProps = {
  label: string;
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  disabled?: (date: Date) => boolean;
  readOnly?: boolean;
};

export function CustomDatePicker({
  label,
  name,
  form,
  className,
  labelClassName,
  disabled,
  readOnly,
}: CustomDatePickerProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col w-full', className)}>
          <FormLabel className={labelClassName}>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild className='w-full'>
              <FormControl className='w-full'>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                  disabled={readOnly}
                >
                  {field.value ? (
                    format(field.value, 'dd/MM/yyyy')
                  ) : (
                    <span>Seleccione un día</span>
                  )}
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 min-w-[var(--radix-popover-trigger-width)]'>
              <Calendar
                locale={es}
                mode='single'
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabled || ((date) => date < new Date('1900-01-01'))}
                captionLayout='dropdown'
                className='w-fit'
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

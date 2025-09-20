import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, useRef } from 'react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type BaseInputFieldProps = {
  label: string;
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  enableClean?: boolean;
  errorClassName?: string;
  regExp?: RegExp;
  integerDigits?: number;
  decimalDigits?: number;
  onChangeInputNumberField?: (e: any) => void;
};

type InputFieldProps = BaseInputFieldProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | keyof BaseInputFieldProps
  >;

/**
 * Componente que permite aplicar validaciones dinámicas mediante expresiones regulares, limitar la cantidad de dígitos enteros
 * y decimales, solo cantidad de dígitos enteros, o solo dígitos numéricos.
 *
 * Normalización:
 * - Si el valor inicial posee un punto (.) lo remplaza por coma (,)
 * - De la misma manera, al editar el valor almacenado en el formulario reemplaza coma (,) por (.)
 *
 * Funcionamiento:
 * - si se envía un expresión regular se aplicará "en vivo" al ingreso de caracteres
 * - Si no recibe la prop regExp, aplicará la restricción utilizando la cantidad de enteros y de decimales indicado
 * - Si no recibe regExp no decimalDigits, utilizará integerDigits para restringir la cantidad de dígitos
 * - Si no se envían props solo permite el ingreso de caracteres numéricos
 *
 * Props:
 * @param {RegExp} [regExp] - Expresión regular personalizada para validar el valor ingresado.
 * @param {number} [integerDigits] - Cantidad máxima de dígitos enteros permitidos.
 * @param {number} [decimalDigits] - Cantidad máxima de dígitos decimales permitidos.
 *
 * @returns {JSX.Element} El campo de entrada numérica renderizado.
 */
export default function InputNumberField({
  label,
  name,
  form,
  className,
  labelClassName,
  enableClean,
  errorClassName,
  regExp,
  integerDigits,
  decimalDigits,
  onChangeInputNumberField,
  ...props
}: InputFieldProps) {
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const lastKeyRef = useRef<string | null>(null);

  // Si recibimos regExp, la utilizamos
  const dynamicRegex =
    regExp ??
    (() => {
      // Si recibimos integerDigits y decimalDigits armamos la expresión regular. Ej:(7, 2) -> 1511111,15
      if (
        typeof integerDigits === 'number' &&
        typeof decimalDigits === 'number'
      ) {
        return new RegExp(
          `^(0(,\\d{0,${decimalDigits}})?|[1-9]\\d{0,${integerDigits - 1}}(,\\d{0,${decimalDigits}})?)$`
        );
      }

      // Si recibimos integerDigits restringimos a la cantidad indicada. Ej: (5) -> 15155
      if (typeof integerDigits === 'number') {
        return new RegExp(`^(0|[1-9]\\d{0,${integerDigits - 1}})$`);
      }

      // Si no recibimos parámetros restringimos el ingreso solo a números
      return /^\d*$/;
    })();

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
              type='text'
              tabIndex={props.readOnly ? -1 : 0}
              className={`${fieldState.invalid ? 'border border-destructive text-destructive placeholder:text-destructive focus-visible:ring-destructive' : ''}`}
              // {...field}
              value={
                typeof field.value === 'string'
                  ? field.value.replace('.', ',')
                  : field.value
              }
              onKeyDown={(e) => {
                lastKeyRef.current = e.key;
              }}
              onChange={(e) => {
                const allowedKeys = [
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'Tab',
                ];
                const value = e.target.value;

                const validValue =
                  !dynamicRegex || dynamicRegex.test(value) || value === '';

                if (
                  !validValue &&
                  !allowedKeys.includes(lastKeyRef.current || '')
                ) {
                  e.target.value = form.getValues(name);
                  return;
                }

                // field.onChange(e);
                // props.onChange?.(e);
                const normalizedValue = value.replace(',', '.');

                field.onChange(normalizedValue);
                onChangeInputNumberField?.(e);
              }}
              onFocus={(e) => {
                field.onBlur();
                if (props.onFocus) {
                  props.onFocus(e);
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                let newValue = value;

                if (value.endsWith(',')) {
                  newValue = value.replace(',', '');
                  e.target.value = newValue;
                  form.setValue(name, newValue.replace(',', '.'));
                }

                field.onBlur();
                props.onBlur?.(e);
              }}
              {...props}
            />
          </FormControl>
          {/* <div
            className={cn(
              `relative transition-all duration-300 ease-in-out ${fieldState.error ? 'opacity-100' : 'opacity-0'}`,
              errorClassName
            )}
          >
            {fieldState.error && (
              // <span className='absolute -top-1 font-normal text-destructive'>
              //    {fieldState.error.message}
              <FormMessage className='absolute -top-1 font-normal' />
              //  </span>
            )}
          </div> */}
          <div
            className={cn(
              `relative transition-all duration-300 ease-in-out ${fieldState.invalid ? 'opacity-100' : 'opacity-0'}`,
              errorClassName
            )}
          >
            <FormMessage className='absolute -top-1 font-normal' />
          </div>
        </FormItem>
      )}
    />
  );
}

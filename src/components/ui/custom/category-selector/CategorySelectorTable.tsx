import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type ColumnDef,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type Row,
  type RowSelectionState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table';
import { LoaderIcon } from 'lucide-react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';

import { FormItem, FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import type { Category } from '@/shared/types';

interface CategorySelectorTableProps<TValue> {
  data: Category[];
  columns: ColumnDef<Category, TValue>[];
  isLoading: boolean;
  form: UseFormReturn<any>;
  nameSchema: string;
  labelClassName?: string;
}

export function CategorySelectorTable<TValue>({
  data,
  columns,
  isLoading,
  form,
  nameSchema,
  labelClassName,
}: CategorySelectorTableProps<TValue>) {
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>(
    {}
  );

  console.log('data', data);

  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(nameSchema, formState);

  const globalFilterFn: FilterFn<any> = (
    row,
    columnId,
    filterValue,
    addMeta
  ) => {
    const value = filterValue as string;

    if (typeof value !== 'string' || value.length === 0) {
      return true;
    }

    const cellValue = row.getValue(columnId);

    return cellValue != null && columnId === 'canPrint'
      ? value === '-99'
        ? true
        : cellValue.toString() === value
      : false;
  };

  // Helper function to get selected IDs from current form value
  const getSelectedIdsFromFormValue = () => {
    const currentValue = form.getValues(nameSchema);
    if (!currentValue || !Array.isArray(currentValue)) return [];

    // Si el valor actual es un array de objetos con id
    if (
      currentValue.length > 0 &&
      typeof currentValue[0] === 'object' &&
      currentValue[0]?.id
    ) {
      return currentValue.map((item: Category) => item.id);
    }

    // Si es un array de números (IDs), lo devolvemos tal como está
    if (currentValue.length > 0 && typeof currentValue[0] === 'number') {
      return currentValue;
    }

    return [];
  };

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id.toString(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection:
        getSelectedIdsFromFormValue()?.reduce(
          (acc: { [key: string]: boolean }, id: number) => {
            acc[id.toString()] = true;
            return acc;
          },
          {}
        ) || {},
    },
    globalFilterFn,
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      setRowSelection(updater);

      const newRowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      const selectedIds = Object.keys(newRowSelection)
        .filter((id) => newRowSelection[id])
        .map((id) => parseInt(id, 10));

      // Buscar los objetos completos de las categorías seleccionadas
      const selectedCategories = data.filter((category) =>
        selectedIds.includes(category.id)
      );

      // Guardar los objetos completos en lugar de solo los IDs
      form.setValue(nameSchema, selectedCategories, { shouldDirty: true });
      form.clearErrors(nameSchema);
      if (form.formState.isSubmitted) form.trigger(nameSchema);
    },
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const selectedIds = getSelectedIdsFromFormValue();
      console.log('selectedIds from form value:', selectedIds);

      const initialRowSelection = selectedIds.reduce(
        (acc: { [key: string]: boolean }, id: number) => {
          acc[id.toString()] = true;
          return acc;
        },
        {}
      );
      console.log('initialRowSelection', initialRowSelection);
      setRowSelection(initialRowSelection);
    }
  }, [data, form]);

  const { rows } = table.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 25,
    getScrollElement: () => tableContainerRef.current,
    measureElement: () => 25,
    overscan: 10,
  });

  return (
    <div
      className={`relative mt-4 h-40 rounded-md border ${!fieldState.invalid ? 'border-neutral-50' : 'border-destructive'}`}
    >
      {/* Header fijo */}
      <div className='sticky top-0 z-10 bg-neutral-50 rounded-t-md'>
        <Table containerClassName=''>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='flex w-full'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='flex !h-[32px] items-center text-base text-gray-700'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      {/* Body con scroll */}
      <div
        className='overflow-auto h-[calc(100%-32px)]'
        ref={tableContainerRef}
      >
        <Table containerClassName=''>
          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className='absolute flex w-[90%] justify-center pt-4'>
                    <LoaderIcon className='h-5 w-5 animate-spin' />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody
              className='relative'
              style={{
                height: `${Math.min(rowVirtualizer.getTotalSize(), 120)}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().length > 0 ? (
                rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index] as Row<Category>;
                  return (
                    <TableRow
                      key={row.id}
                      className={`absolute flex !h-[25px] w-full border-y-0 ${index % 2 === 0 ? 'bg-transparent' : 'bg-neutral-50'}`}
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className='flex !h-[25px] items-center text-base py-1'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className='absolute flex w-full'>
                  <TableCell colSpan={2} className='w-full text-center'>
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}

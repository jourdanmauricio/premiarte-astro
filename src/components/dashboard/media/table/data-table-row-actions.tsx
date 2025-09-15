'use client';

import type { Row } from '@tanstack/react-table';
import { Trash2Icon, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Image } from '@/shared/types';

interface DataTableRowActionsProps {
  row: Row<Image>;
  onEdit: (value: Image) => void;
  onDelete: (value: Image) => void;
}

function DataTableRowActions({
  row,
  onEdit,
  onDelete,
}: DataTableRowActionsProps) {
  return (
    <div className='flex items-center justify-start gap-2'>
      <Button
        // disabled={
        //   !hasPermissionTo(permissions.payroll.seizures.edit) || row.original.status === 'F'
        // }
        variant='ghost'
        size='sm'
        className='icon-action rounded-full p-2'
        onClick={() => {
          onEdit(row.original);
        }}
      >
        <Pencil className='h-5 w-5' />
      </Button>

      <Button
        // disabled={isDeleteDisabled}
        variant='ghost'
        size='sm'
        className='icon-action rounded-full p-2'
        onClick={() => {
          onDelete(row.original);
        }}
      >
        <Trash2Icon className='h-5 w-5' />
      </Button>
    </div>
  );
}

export default DataTableRowActions;

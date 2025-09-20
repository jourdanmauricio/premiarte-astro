import { Checkbox } from '@/components/ui/checkbox';
import { TruncatedCell } from '@/components/ui/custom/truncatedCell';

export const getColumns = () => [
  {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllRowsSelected(!!value);
        }}
        aria-label='Select all'
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
        aria-label='Select row'
        disabled={!row.getCanSelect()}
      />
    ),
    size: 56,
  },
  {
    accessorKey: 'name',
    header: 'Productos',
    size: 400,
    cell: ({ row }: { row: any }) => {
      const product = row.original;
      return <TruncatedCell value={product.name} linesMax={1} />;
    },
  },
];

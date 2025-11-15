import z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InputForm from '@/components/ui/custom/input-field';
import { Form } from '@/components/ui/form';
import { SearchIcon } from 'lucide-react';
import Dropdown from '@/components/ui/custom/dropdown';
import { orderStatusList } from '@/shared/consts';

interface FilterOrdersProps {
  globalFilter: { search: string; status: string };
  handleSearch: (key: string, value: string) => void;
}

const FilterOrdersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});

const FilterOrders = ({
  globalFilter,
  handleSearch,
}: FilterOrdersProps) => {
  const form = useForm({
    resolver: zodResolver(FilterOrdersSchema),
    defaultValues: globalFilter,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'search') {
        handleSearch('search', value.search || '');
      }
      if (name === 'status') {
        handleSearch('status', value.status || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleSearch]);

  return (
    <Form {...form}>
      <form>
        <div className='flex items-center gap-4'>
          <InputForm
            label=''
            name='search'
            className='min-w-[250px]'
            placeholder='Buscar pedido'
            form={form}
            enableClean
            icon={<SearchIcon className='size-4' />}
          />
          <Dropdown
            label=''
            name='status'
            placeholder='Estado'
            form={form}
            list={orderStatusList}
            className='min-w-[250px]'
            enableClean
          />
        </div>
      </form>
    </Form>
  );
};

export { FilterOrders };

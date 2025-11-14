import z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CategoriesDropdown } from '@/components/ui/custom/dropdowns/CategoriesDropdown';
import InputForm from '@/components/ui/custom/input-field';
import { Form } from '@/components/ui/form';
import { SearchIcon } from 'lucide-react';
import Dropdown from '@/components/ui/custom/dropdown';
import { budgetStatusList } from '@/shared/consts';

interface FilterBudgetsProps {
  globalFilter: { search: string; status: string };
  handleSearch: (key: string, value: string) => void;
}

const FilterBudgetsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});

const FilterBudgets = ({
  globalFilter,
  handleSearch,
}: FilterBudgetsProps) => {
  const form = useForm({
    resolver: zodResolver(FilterBudgetsSchema),
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
            placeholder='Buscar presupuesto'
            form={form}
            enableClean
            icon={<SearchIcon className='size-4' />}
          />
          <Dropdown
            label=''
            name='status'
            placeholder='Estado'
            form={form}
            list={budgetStatusList}
            className='min-w-[250px]'
            enableClean
          />
        </div>
      </form>
    </Form>
  );
};

export { FilterBudgets };

import z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CategoriesDropdown } from '@/components/ui/custom/dropdowns/CategoriesDropdown';
import InputForm from '@/components/ui/custom/input-field';
import { Form } from '@/components/ui/form';
import { SearchIcon } from 'lucide-react';

interface FilterProductsProps {
  globalFilter: { search: string; category: string };
  handleSearch: (key: string, value: string) => void;
}

const FilterProductsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

const FilterProducts = ({
  globalFilter,
  handleSearch,
}: FilterProductsProps) => {
  const form = useForm({
    resolver: zodResolver(FilterProductsSchema),
    defaultValues: globalFilter,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'search') {
        handleSearch('search', value.search || '');
      }
      if (name === 'category') {
        handleSearch('category', value.category || '');
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
            placeholder='Buscar producto'
            form={form}
            enableClean
            icon={<SearchIcon className='size-4' />}
          />
          <CategoriesDropdown
            name='category'
            form={form}
            label=''
            placeholder='Seleccione categoría...'
            className='min-w-[250px]'
          />
        </div>
      </form>
    </Form>
  );
};

export { FilterProducts };

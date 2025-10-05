import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import InputField from '@/components/ui/custom/input-field';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon } from 'lucide-react';

interface FilterCategoriesProps {
  globalFilter: { search: string };
  handleSearch: (key: string, value: string) => void;
}

const FilterCategoriesSchema = z.object({
  search: z.string().optional(),
});

const FilterCategories = ({
  globalFilter,
  handleSearch,
}: FilterCategoriesProps) => {
  const form = useForm({
    resolver: zodResolver(FilterCategoriesSchema),
    defaultValues: globalFilter,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'search') {
        handleSearch('search', value.search || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleSearch]);

  return (
    <Form {...form}>
      <form>
        <InputField
          name='search'
          form={form}
          icon={<SearchIcon className='size-4' />}
          enableClean
          className='min-w-[250px]'
          placeholder='Buscar categoría'
          label=''
        />
      </form>
    </Form>
  );
};

export { FilterCategories };

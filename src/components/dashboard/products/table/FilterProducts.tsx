import { CategoriesDropdown } from '@/components/ui/custom/dropdowns/CategoriesDropdown';
import InputForm from '@/components/ui/custom/input-field';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface FilterProductsProps {
  globalFilter: { search: string; category: string };
  handleSearch: (key: string, value: string) => void;
}

const FilterProducts = ({
  globalFilter,
  handleSearch,
}: FilterProductsProps) => {
  const form = useForm({
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

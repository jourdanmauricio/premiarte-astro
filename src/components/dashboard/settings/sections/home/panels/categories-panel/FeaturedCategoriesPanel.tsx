import type z from 'zod';
import type { UseFormReturn } from 'react-hook-form';

import type { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';

interface CategoriesPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
}

const FeaturedCategoriesPanel = ({ form }: CategoriesPanelProps) => {
  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Sección Categorías</h2>
      <div className='grid grid-cols-2 gap-4 p-6'>
        <div className='w-full'>
          <InputField
            label='Título'
            name='home.featuredCategories.title'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Texto'
            name='home.featuredCategories.text'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Texto del botón'
            name='home.featuredCategories.buttonText'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Link del botón'
            name='home.featuredCategories.buttonLink'
            form={form}
          />
        </div>
      </div>
    </>
  );
};

export { FeaturedCategoriesPanel };

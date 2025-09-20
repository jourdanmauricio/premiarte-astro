import type z from 'zod';
import type { UseFormReturn } from 'react-hook-form';

import type { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';

interface ProductsPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
}

const FeaturedProductsPanel = ({ form }: ProductsPanelProps) => {
  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Sección Productos</h2>
      <div className='grid grid-cols-2 gap-4 p-6'>
        <div className='w-full'>
          <InputField
            label='Título'
            name='home.featuredProducts.title'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Texto'
            name='home.featuredProducts.text'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Texto del botón'
            name='home.featuredProducts.buttonText'
            form={form}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Link del botón'
            name='home.featuredProducts.buttonLink'
            form={form}
          />
        </div>
      </div>
    </>
  );
};

export { FeaturedProductsPanel };

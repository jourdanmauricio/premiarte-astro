import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateSlug } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import type { Product } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { productsService } from '@/lib/services';
import { ProductFromSchema } from '@/shared/schemas';
import { DialogHeader } from '@/components/ui/dialog';
import Dropdown from '@/components/ui/custom/dropdown';
import InputField from '@/components/ui/custom/input-field';
import SubmitButton from '@/components/ui/custom/submit-button';
import TextareaField from '@/components/ui/custom/textarea-field';
import BooleanCheckbox from '@/components/ui/custom/boolean-checkbox';
import InputNumberField from '@/components/ui/custom/input-number-field';
import ImagesSelector from '@/components/ui/custom/images-selector/ImagesSelector';
import CategorySelector from '@/components/ui/custom/category-selector/CategorySelector';
import ProductSelector from '@/components/ui/custom/product-selector/ProductSelector';
import useProductModal from '@/components/dashboard/products/modal/useProductModal';

interface ProductModalProps {
  open: boolean;
  closeModal: () => void;
  product: Product | null;
}

const ProductModal = ({ open, closeModal, product }: ProductModalProps) => {
  const { mode, form, productMutation, onSubmit, onError, handlePriceChange } =
    useProductModal(product, closeModal);

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent
        className='max-h-[95%] overflow-auto'
        style={{
          minWidth: '600px',
          maxWidth: '900px',
        }}
      >
        <div style={{ minWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle className='dialog-title'>
              {mode === 'CREATE'
                ? 'Nuevo producto'
                : `Editar producto ${form.watch('name')}`}
            </DialogTitle>
            <DialogDescription />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <div className='mt-4 grid grid-cols-2 gap-12'>
                  <InputField
                    label='Nombre'
                    name='name'
                    placeholder='Nombre del producto'
                    form={form}
                    onBlur={(e) => {
                      const value = e.target.value;
                      form.setValue('slug', generateSlug(value));
                    }}
                  />
                  <InputField
                    label='Slug'
                    name='slug'
                    placeholder='Slug'
                    form={form}
                  />

                  <TextareaField
                    label='Descripción'
                    name='description'
                    placeholder='Descripción'
                    form={form}
                    className='col-span-2'
                  />

                  <ImagesSelector
                    label='Imágenes del producto'
                    name='images'
                    form={form}
                    maxImages={5}
                    className='col-span-2'
                    defaultTag='Productos'
                  />

                  <div className='flex gap-4'>
                    <BooleanCheckbox
                      label='Activo'
                      name='isActive'
                      form={form}
                    />
                    <BooleanCheckbox
                      label='Recomendado'
                      name='isFeatured'
                      form={form}
                    />
                  </div>

                  <InputField
                    label='SKU'
                    name='sku'
                    placeholder='SKU'
                    form={form}
                  />

                  <InputNumberField
                    label='Stock'
                    name='stock'
                    placeholder='Stock'
                    form={form}
                    integerDigits={10}
                  />

                  <InputNumberField
                    label='Precio'
                    name='price'
                    placeholder='Precio'
                    form={form}
                    integerDigits={10}
                    decimalDigits={2}
                    onChangeInputNumberField={(e) =>
                      handlePriceChange('price')(e.target.value)
                    }
                  />
                  <InputNumberField
                    label='Precio de venta'
                    name='retailPrice'
                    placeholder='Precio de venta'
                    form={form}
                    integerDigits={10}
                    decimalDigits={2}
                    onChangeInputNumberField={(e) =>
                      handlePriceChange('retailPrice')(e.target.value)
                    }
                  />

                  <InputNumberField
                    label='Precio mayorista'
                    name='wholesalePrice'
                    placeholder='Precio mayorista'
                    form={form}
                    integerDigits={10}
                    decimalDigits={2}
                    onChangeInputNumberField={(e) =>
                      handlePriceChange('wholesalePrice')(e.target.value)
                    }
                  />

                  <Dropdown
                    label='Tipo de descuento'
                    list={[
                      { id: 'percentage', description: 'Porcentaje' },
                      { id: 'fixed', description: 'Fijo' },
                    ]}
                    name='discountType'
                    form={form}
                    placeholder='Tipo de descuento'
                    onChange={(e) => {
                      form.setValue('discount', '0');
                    }}
                  />

                  <InputNumberField
                    label='Descuento'
                    name='discount'
                    placeholder='Descuento'
                    form={form}
                    regExp={
                      form.watch('discountType') === 'percentage'
                        ? new RegExp('^(0|[1-9]\\d?|100)$')
                        : new RegExp(
                            '^(0(,\\d{0,2})?|[1-9]\\d{0,9}(,\\d{0,2})?)$'
                          )
                    }
                  />

                  <CategorySelector name='categories' form={form} />

                  <ProductSelector name='relatedProducts' form={form} />

                  <div className='col-span-2 flex justify-end gap-8 pt-10'>
                    <Button
                      type='button'
                      onClick={closeModal}
                      variant='outline'
                      className='min-w-[150px]'
                    >
                      Cancelar
                    </Button>
                    <SubmitButton
                      label={mode === 'CREATE' ? 'Crear producto' : 'Guardar'}
                      className='min-w-[150px]'
                      showSpinner={productMutation.isPending}
                      disabled={
                        productMutation.isPending || !form.formState.isDirty
                      }
                    />
                  </div>
                </div>
              </form>
            </Form>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ProductModal };

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import SubmitButton from '@/components/ui/custom/submit-button';
import type { BudgetItemRow, ProductWithDetails } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { setPrices } from '@/shared/functions';
import { BudgetItemFormSchema } from '@/shared/schemas';
import TextareaField from '@/components/ui/custom/textarea-field';
import ProductsCombobox from '@/components/ui/custom/products-combobox';
import InputNumberField from '@/components/ui/custom/input-number-field';

interface ItemModalProps {
  open: boolean;
  closeModal: () => void;
  item: BudgetItemRow | null;
  type: 'retail' | 'wholesale';
  addItem: (item: BudgetItemRow) => void;
  editItem: (item: BudgetItemRow) => void;
}

const defaultValues = {
  name: '',
  slug: '',
  sku: '',
  retailPrice: '',
  wholesalePrice: '',
  price: '',
  quantity: '1',
  amount: '',
  observation: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ItemModal = ({
  open,
  closeModal,
  item,
  type,
  addItem,
  editItem,
}: ItemModalProps) => {
  const mode = item ? 'EDIT' : 'CREATE';

  const form = useForm<z.infer<typeof BudgetItemFormSchema>>({
    resolver: zodResolver(BudgetItemFormSchema),
    defaultValues:
      mode === 'EDIT' && item
        ? {
            id: item.id,
            productId: item.productId,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt,
            name: item.name,
            slug: item.slug,
            sku: item.sku,
            retailPrice: item.retailPrice,
            wholesalePrice: item.wholesalePrice,
            price: item.price,
            quantity: item.quantity.toString(),
            amount: item.amount,
            observation: item.observation || '',
          }
        : defaultValues,
  });

  const onSubmit = (data: z.infer<typeof BudgetItemFormSchema>) => {
    if (mode === 'CREATE') {
      addItem(data);
    } else {
      editItem(data);
    }
    closeModal();
  };

  const handleProductChange = (product: ProductWithDetails) => {
    const { price, retailPrice, wholesalePrice } = setPrices(type, product);
    form.setValue('id', product.id);
    form.setValue('price', price);
    form.setValue('wholesalePrice', wholesalePrice);
    form.setValue('retailPrice', retailPrice);
    form.setValue('productId', product.id);
    form.setValue('imageUrl', product?.detImages?.[0]?.url || '');
    form.setValue('imageAlt', product?.detImages?.[0]?.alt || '');
    form.setValue('name', product.name);
    form.setValue('slug', product.slug);
    form.setValue('sku', product.sku || '');
    form.setValue('amount', (+price * +form.getValues('quantity')).toString());
    form.setValue('observation', '', { shouldDirty: true });
  };

  const onError = () => console.log('errors', form.formState.errors);

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className='max-h-[95%] max-w-xl sm:max-w-xl overflow-y-auto w-full'>
        <DialogHeader>
          <DialogTitle className='dialog-title'>
            {mode === 'CREATE'
              ? 'Agregar producto'
              : `Editar producto ${form.watch('name')}`}
          </DialogTitle>
          <DialogDescription />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className='mt-4 flex flex-col gap-6 w-full'
            >
              <ProductsCombobox
                label='Producto'
                name='productId'
                placeholder='Seleccionar producto'
                form={form}
                className='w-full'
                onChange={handleProductChange}
              />

              <div className='flex items-center gap-12 w-full'>
                <InputNumberField
                  label='Cantidad'
                  name='quantity'
                  placeholder='Cantidad'
                  integerDigits={5}
                  form={form}
                  className='w-full'
                  onChangeInputNumberField={(e) => {
                    form.setValue(
                      'amount',
                      (+form.getValues('price') * +e.target.value).toString(),
                      { shouldDirty: true }
                    );
                  }}
                />

                <InputNumberField
                  label='Precio'
                  name='price'
                  placeholder='Precio'
                  integerDigits={10}
                  form={form}
                  className='w-full'
                  onChangeInputNumberField={(e) => {
                    form.setValue(
                      'amount',
                      (
                        +e.target.value * +form.getValues('quantity')
                      ).toString(),
                      { shouldDirty: true }
                    );
                    if (type === 'retail') {
                      form.setValue('retailPrice', e.target.value, {
                        shouldDirty: true,
                      });
                    } else {
                      form.setValue('wholesalePrice', e.target.value, {
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              </div>

              <InputNumberField
                label='Total'
                name='amount'
                placeholder='Total'
                integerDigits={9}
                decimalDigits={2}
                form={form}
                className='w-full'
              />

              <TextareaField
                label='Observación'
                name='observation'
                placeholder='Observación'
                form={form}
                className='w-full'
              />

              <div className='flex justify-end gap-8 pt-10'>
                <Button
                  type='button'
                  onClick={closeModal}
                  variant='outline'
                  className='min-w-[150px]'
                >
                  Cancelar
                </Button>
                <SubmitButton
                  label={mode === 'CREATE' ? 'Agregar producto' : 'Aceptar'}
                  className='min-w-[150px]'
                  showSpinner={false}
                  disabled={false || !form.formState.isDirty}
                />
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { ItemModal };

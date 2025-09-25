import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { DialogHeader } from '@/components/ui/dialog';
import type { Product } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { ProductFromSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import ImagesSelector from '@/components/ui/custom/images-selector/ImagesSelector';
import { productsService } from '@/lib/services';
import TextareaField from '@/components/ui/custom/textarea-field';
import BooleanCheckbox from '@/components/ui/custom/boolean-checkbox';
import InputNumberField from '@/components/ui/custom/input-number-field';
import Dropdown from '@/components/ui/custom/dropdown';
import CategorySelector from '@/components/ui/custom/category-selector/CategorySelector';
import ProductSelector from '@/components/ui/custom/product-selector/ProductSelector';
import { generateSlug } from '@/lib/utils';

interface ProductModalProps {
  open: boolean;
  closeModal: () => void;
  product: Product | null;
}

const defaultValues = {
  name: '',
  description: '',
  slug: '',
  imageId: 0,
  isActive: true,
  isFeatured: false,
  price: '',
  sku: '',
  stock: '',
  retailPrice: '',
  wholesalePrice: '',
  discount: '',
  discountType: 'percentage' as const,
  relatedProducts: [],
  images: [],
  categories: [],
};

const ProductModal = ({ open, closeModal, product }: ProductModalProps) => {
  const mode = product ? 'EDIT' : 'CREATE';
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof ProductFromSchema>>({
    resolver: zodResolver(ProductFromSchema),
    defaultValues:
      mode === 'EDIT' && product && 'slug' in product
        ? {
            name: product.name,
            slug: product.slug,
            description: product.description,
            images: Array.isArray(product.images)
              ? product.images.map((img: any) =>
                  typeof img === 'object' ? img.id : img
                )
              : [],
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            relatedProducts: product.relatedProducts || [],
            categories: Array.isArray(product.categories)
              ? product.categories.map(
                  (cat: any) =>
                    typeof cat === 'object'
                      ? cat // Mantener objeto completo para el CategorySelector
                      : { id: cat, name: '', slug: '' } // Si es solo ID, crear objeto mínimo
                )
              : [],
            price: product.price ? product.price.toString() : '',
            sku: product.sku ? product.sku.toString() : '',
            stock: product.stock ? product.stock.toString() : '',
            retailPrice: product.retailPrice
              ? product.retailPrice.toString()
              : '',
            wholesalePrice: product.wholesalePrice
              ? product.wholesalePrice.toString()
              : '',
            discount: product.discount ? product.discount.toString() : '',
            discountType: product.discountType || 'percentage',
          }
        : defaultValues,
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ProductFromSchema>) => {
      const productData = {
        ...data,
        // Convertir strings a números para los campos numéricos
        price: data.price ? parseFloat(data.price) : undefined,
        stock: data.stock ? parseInt(data.stock) : undefined,
        retailPrice: data.retailPrice
          ? parseFloat(data.retailPrice)
          : undefined,
        wholesalePrice: data.wholesalePrice
          ? parseFloat(data.wholesalePrice)
          : undefined,
        discount: data.discount ? parseFloat(data.discount) : undefined,
        discountType: data.discountType || 'percentage',
        categories: data.categories.map((category) => category.id),
      };

      if (mode === 'EDIT' && product?.id) {
        return productsService.updateProduct(product.id, productData);
      } else {
        return productsService.createProduct(productData);
      }
    },
    onSuccess: async () => {
      // Invalidar todas las consultas relacionadas para mantener selectores actualizados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['images'] }),
      ]);
      toast.success(
        mode === 'CREATE'
          ? 'Producto creado correctamente'
          : 'Producto actualizado correctamente'
      );
      closeModal();
      form.reset();
    },
    onError: (error) => {
      console.error('Error al guardar el producto:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el producto'
      );
    },
  });

  const onSubmit = (data: z.infer<typeof ProductFromSchema>) => {
    categoryMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  console.log('Form data', form.getValues());
  console.log('Errors', form.formState.errors);

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
                  />
                  <InputNumberField
                    label='Precio de venta'
                    name='retailPrice'
                    placeholder='Precio de venta'
                    form={form}
                    integerDigits={10}
                    decimalDigits={2}
                  />

                  <InputNumberField
                    label='Precio mayorista'
                    name='wholesalePrice'
                    placeholder='Precio mayorista'
                    form={form}
                    integerDigits={10}
                    decimalDigits={2}
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
                      showSpinner={categoryMutation.isPending}
                      disabled={
                        categoryMutation.isPending || !form.formState.isDirty
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

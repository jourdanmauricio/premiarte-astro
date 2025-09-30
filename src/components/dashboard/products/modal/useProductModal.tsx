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

const useProductModal = (product: Product | null, closeModal: () => void) => {
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
            priceUpdatedAt: product.priceUpdatedAt
              ? product.priceUpdatedAt
              : '',
          }
        : defaultValues,
  });

  const productMutation = useMutation({
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
    productMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  // Función helper para detectar cambios de precio
  const handlePriceChange = (
    fieldName: 'price' | 'retailPrice' | 'wholesalePrice'
  ) => {
    return (value: string) => {
      // Solo actualizar si estamos en modo edición y el valor ha cambiado
      if (mode === 'EDIT' && product) {
        const originalValue = product[fieldName]?.toString() || '';
        if (value !== originalValue) {
          form.setValue('priceUpdatedAt', new Date().toISOString());
        }
      }
    };
  };

  // console.log('Form data', form.getValues());
  // console.log('Errors', form.formState.errors);

  return {
    mode,
    form,
    productMutation,
    onSubmit,
    onError,
    handlePriceChange,
  };
};

export default useProductModal;

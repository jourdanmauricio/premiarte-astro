import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@/shared/types';
import { productsService } from '@/lib/services';
import { ProductFromSchema } from '@/shared/schemas';

const defaultValues = {
  name: '',
  description: '',
  slug: '',
  imageId: 0,
  isActive: true,
  isFeatured: false,
  sku: '',
  stock: '',
  retailPrice: '',
  wholesalePrice: '',
  // priceUpdatedAt: '',
  // priceUpdated: '',
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
            sku: product.sku ? product.sku.toString() : '',
            stock: product.stock ? product.stock.toString() : '',
            retailPrice: product.retailPrice
              ? product.retailPrice.toString()
              : '',
            wholesalePrice: product.wholesalePrice
              ? product.wholesalePrice.toString()
              : '',
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
        stock: data.stock ? parseInt(data.stock) : undefined,
        retailPrice: data.retailPrice
          ? parseFloat(data.retailPrice)
          : undefined,
        wholesalePrice: data.wholesalePrice
          ? parseFloat(data.wholesalePrice)
          : undefined,
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
  const handlePriceChange = (fieldName: 'retailPrice' | 'wholesalePrice') => {
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

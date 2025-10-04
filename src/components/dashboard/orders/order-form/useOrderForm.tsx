import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { BudgetFormSchema, OrderFormSchema } from '@/shared/schemas';
import { budgetsService } from '@/lib/services/budgetsService';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getBudgetItemColumns } from './table/budgetItemsColumns';
import type { BudgetItemRow, OrderItemRow } from '@/shared/types';
import { toast } from 'sonner';
import { ordersService } from '@/lib/services/ordersService';

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  type: 'retail' as 'retail' | 'wholesale',
  createdAt: new Date(),
  expiresAt: new Date(new Date().setDate(new Date().getDate() + 15)),
  status: 'pending' as 'pending' | 'approved' | 'rejected' | 'expired',
  observation: '',
  totalAmount: '',
  items: [],
};

export const useOrderForm = () => {
  const [currentItem, setCurrentItem] = useState<BudgetItemRow | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [customerModalIsOpen, setCustomerModalIsOpen] = useState(false);

  const { id } = useParams();
  const mode = id === 'new' ? 'CREATE' : 'EDIT';
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrderById(parseInt(id!)),
    enabled: !!id && mode === 'EDIT',
  });

  const form = useForm<z.infer<typeof OrderFormSchema>>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'EDIT' && order) {
      setTimeout(() => {
        const orderData = {
          ...order,
          customerId: order.customerId,
          items: order.items?.map((item) => ({
            ...item,
            quantity: item.quantity.toString(),
            price: item.price ? item.price.toString() : '0',
            amount: item.amount ? item.amount.toString() : '0',
            retailPrice: item.retailPrice ? item.retailPrice.toString() : '0',
            wholesalePrice: item.wholesalePrice
              ? item.wholesalePrice.toString()
              : '0',
          })),
          observation: order.observation ?? '',
          totalAmount: order.totalAmount ? order.totalAmount.toString() : '0',
          type: order.type || 'retail',
          status: order.status,
          createdAt: order.createdAt ? new Date(order.createdAt) : undefined,
        };
        form.reset(orderData);
      }, 0);
    }
  }, [mode, order]);

  const orderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof OrderFormSchema>) => {
      const orderData = {
        ...data,
        customerId: data.customerId || 0,
        observation: data.observation || '',
        type: data.type || 'retail',
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : 0,
        status: data.status || 'pending',
        items: data.items.map((item) => ({
          ...item,
          productId: item.productId || 0,
          retailPrice: item.retailPrice ? parseFloat(item.retailPrice) : 0,
          wholesalePrice: item.wholesalePrice
            ? parseFloat(item.wholesalePrice)
            : 0,
          price: item.price ? parseFloat(item.price) : 0,
          quantity: item.quantity ? parseInt(item.quantity) : 0,
          amount: item.amount ? parseFloat(item.amount) : 0,
        })),
      };

      if (mode === 'EDIT' && order?.id) {
        return ordersService.updateOrder(order.id, orderData);
      } else {
        return ordersService.createOrder(orderData);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(
        mode === 'CREATE'
          ? 'Pedido creado correctamente'
          : 'Pedido actualizado correctamente'
      );
      navigate('/dashboard/orders');
      await queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el pedido'
      );
    },
  });

  const handleDeleteOrder = (item: OrderItemRow) => {
    setCurrentItem(item);
    setDeleteModalIsOpen(true);
  };

  const handleEditOrder = (item: OrderItemRow) => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  const itemColumns = useMemo(
    () =>
      getBudgetItemColumns({
        onDelete: handleDeleteOrder,
        onEdit: handleEditOrder,
      }),
    [handleDeleteOrder, handleEditOrder]
  );

  const handleCalculateTotal = () => {
    console.log('handleCalculateTotal');
    let totalAmount = 0;
    const items = form.getValues('items')!;
    const updatedItems = items.map((item) => {
      const price =
        form.watch('type') === 'retail'
          ? item.retailPrice
            ? item.retailPrice.toString()
            : '0'
          : item.wholesalePrice
            ? item.wholesalePrice.toString()
            : '0';
      const amount = +price * +item.quantity;
      totalAmount += amount;
      // Retornar un nuevo objeto item con los valores actualizados
      return {
        ...item,
        price: price.toString(),
        amount: amount.toString(),
      };
    });
    form.setValue('items', updatedItems);
    form.setValue('totalAmount', totalAmount.toString());
  };

  useEffect(() => {
    handleCalculateTotal();
  }, [form.watch('type')]);

  const handleShowItemModal = () => {
    setCurrentItem(null);
    setShowItemModal(true);
  };

  const handleAddItem = (item: OrderItemRow) => {
    form.setValue('items', [...form.getValues('items'), item], {
      shouldDirty: true,
    });
    handleCalculateTotal();
  };

  const handleEditItem = (item: OrderItemRow) => {
    const items = form.getValues('items')!;
    const updatedItems = items.map((i) => (i.id === item.id ? item : i));
    form.setValue('items', updatedItems, {
      shouldDirty: true,
    });
    handleCalculateTotal();
  };

  const handleConfirmDelete = () => {
    const items = form.getValues('items')!;
    const updatedItems = items.filter((i) => i.id !== currentItem?.id);
    form.setValue('items', updatedItems, {
      shouldDirty: true,
    });
    handleCalculateTotal();
  };

  const onSubmit = (data: z.infer<typeof OrderFormSchema>) => {
    orderMutation.mutate(data);
  };

  const onError = () => console.log('errors', form.formState.errors);

  return {
    order,
    form,
    isLoading,
    mode,
    itemColumns,
    currentItem,
    showItemModal,
    deleteModalIsOpen,
    isPending: orderMutation.isPending,
    customerModalIsOpen,
    setCustomerModalIsOpen,
    setDeleteModalIsOpen,
    handleConfirmDelete,
    handleShowItemModal,
    setShowItemModal,
    setCurrentItem,
    handleEditItem,
    handleAddItem,
    onSubmit,
    onError,
  };
};

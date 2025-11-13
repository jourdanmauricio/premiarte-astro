import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { BudgetFormSchema } from '@/shared/schemas';
import { budgetsService } from '@/lib/services/budgetsService';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getBudgetItemColumns } from './table/budgetItemsColumns';
import type {
  BudgetItemRow,
  BudgetStatus,
  CreateBudgetData,
  UpdateBudgetData,
} from '@/shared/types';
import { toast } from 'sonner';

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  type: 'retail' as 'retail' | 'wholesale',
  createdAt: new Date(),
  expiresAt: new Date(new Date().setDate(new Date().getDate() + 15)),
  status: 'pending' as BudgetStatus,
  observation: '',
  totalAmount: '',
  items: [],
  responsibleId: '',
};

export const useBudgetForm = () => {
  const [currentItem, setCurrentItem] = useState<BudgetItemRow | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [customerModalIsOpen, setCustomerModalIsOpen] = useState(false);

  const { id } = useParams();
  const mode = id === 'new' ? 'CREATE' : 'EDIT';
  const queryClient = useQueryClient();

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsService.getBudgetById(parseInt(id!)),
    enabled: !!id && mode === 'EDIT',
  });

  const form = useForm<z.infer<typeof BudgetFormSchema>>({
    resolver: zodResolver(BudgetFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'EDIT' && budget) {
      setTimeout(() => {
        const budgetData = {
          ...budget,
          customerId: budget.customerId,
          responsibleId:
            budget.responsibleId && budget.responsibleId.toString(),
          items: budget.items?.map((item) => ({
            ...item,
            quantity: item.quantity.toString(),
            price: item.price ? item.price.toString() : '0',
            amount: item.amount ? item.amount.toString() : '0',
            retailPrice: item.retailPrice ? item.retailPrice.toString() : '0',
            wholesalePrice: item.wholesalePrice
              ? item.wholesalePrice.toString()
              : '0',
          })),
          observation: budget.observation ?? '',
          totalAmount: budget.totalAmount ? budget.totalAmount.toString() : '0',
          type: budget.type || 'retail',
          status: budget.status as BudgetStatus,
          createdAt: budget.createdAt ? new Date(budget.createdAt) : undefined,
          expiresAt: budget.expiresAt ? new Date(budget.expiresAt) : undefined,
          approvedAt: budget.approvedAt
            ? new Date(budget.approvedAt)
            : undefined,
          rejectedAt: budget.rejectedAt
            ? new Date(budget.rejectedAt)
            : undefined,
        };
        form.reset(budgetData);
      }, 0);
    }
  }, [mode, budget]);

  const budgetMutation = useMutation({
    mutationFn: async (budgetData: CreateBudgetData | UpdateBudgetData) => {
      if (mode === 'EDIT' && budget?.id) {
        await budgetsService.updateBudget(
          budget.id,
          budgetData as UpdateBudgetData
        );
      } else {
        await budgetsService.createBudget(budgetData as CreateBudgetData);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['budgets'] }),
        queryClient.invalidateQueries({ queryKey: ['budget', id] }),
      ]);
      toast.success(
        mode === 'CREATE'
          ? 'Presupuesto creado correctamente'
          : 'Presupuesto actualizado correctamente'
      );
      navigate('/dashboard/budgets');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al guardar el presupuesto'
      );
    },
  });

  const handleDeleteBudget = (item: BudgetItemRow) => {
    setCurrentItem(item);
    setDeleteModalIsOpen(true);
  };

  const handleEditBudget = (item: BudgetItemRow) => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  const itemColumns = useMemo(
    () =>
      getBudgetItemColumns({
        onDelete: handleDeleteBudget,
        onEdit: handleEditBudget,
      }),
    [handleDeleteBudget, handleEditBudget]
  );

  const handleCalculateTotal = () => {
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
    if (budget) {
      handleCalculateTotal();
    }
  }, [form.watch('type')]);

  const handleShowItemModal = () => {
    setCurrentItem(null);
    setShowItemModal(true);
  };

  const handleAddItem = (item: BudgetItemRow) => {
    form.setValue('items', [...form.getValues('items'), item], {
      shouldDirty: true,
    });
    handleCalculateTotal();
  };

  const handleEditItem = (item: BudgetItemRow) => {
    const items = form.getValues('items')!;
    console.log('item', item);
    console.log('items', items);
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

  const onSubmit = async (data: z.infer<typeof BudgetFormSchema>) => {
    const budgetData = {
      ...data,
      customerId: data.customerId || 0,
      responsibleId: Number(data.responsibleId),
      observation: data.observation || '',
      expiresAt: data.expiresAt?.toISOString() || undefined,
      type: data.type || 'retail',
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : 0,
      status: data.status || ('pending' as BudgetStatus),
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

    await budgetMutation.mutateAsync(budgetData);
  };

  const onError = () => console.log('errors', form.formState.errors);

  return {
    budget,
    form,
    isLoading,
    mode,
    itemColumns,
    currentItem,
    showItemModal,
    deleteModalIsOpen,
    isPending: budgetMutation.isPending,
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

import type { OrderItemFormSchema } from '@/shared/schemas';
import type z from 'zod';

export interface Order {
  id: number;
  customerId: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'wholesale' | 'retail';
  observation?: string;
  totalAmount: number; // en centavos
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  userId?: string; // ID del usuario de Clerk
  isRead: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  sku: string;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  retailPrice: number; // precio unitario en centavos
  wholesalePrice: number; // precio unitario en centavos
  price: number; // precio unitario en centavos
  quantity: number;
  amount: number; // precio total del item (price * quantity)
  observation?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderData {
  customerId: number;
  userId?: string;
  observation?: string;
  totalAmount: number;
  type: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  productId: number;
  retailPrice: number;
  wholesalePrice: number;
  price: number;
  quantity: number;
  amount: number;
  observation?: string;
}

export interface UpdateOrderData {
  customerId?: number;
  observation?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  items?: CreateOrderItemData[];
}

export interface OrderFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  customerId?: number;
  userId?: string;
}

export type OrderItemRow = z.infer<typeof OrderItemFormSchema>;

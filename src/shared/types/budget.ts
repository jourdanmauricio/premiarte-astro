export interface Budget {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  observation?: string;
  totalAmount: number; // en centavos
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  userId?: string; // ID del usuario de Clerk
  isRead: boolean;
  expiresAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: BudgetItem[]; // items del presupuesto (relación)
}

export interface BudgetItem {
  id: number;
  budgetId: number;
  productId: number;
  sku: string;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  price: number; // precio unitario en centavos
  quantity: number;
  amount: number; // precio total del item (price * quantity)
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  message?: string;
}

export interface BudgetWithItems extends Budget {
  items: BudgetItem[];
}

// Tipos para crear nuevos presupuestos
export interface CreateBudgetData {
  customerId: number;
  userId?: string;
  observation?: string;
  items: CreateBudgetItemData[];
}

export interface CreateBudgetItemData {
  productId: number;
  sku: string;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  price?: number | null;
  quantity: number;
  observation?: string;
}

// Tipos para actualizar presupuestos
export interface UpdateBudgetData {
  customerId?: number;
  observation?: string;
  status?: Budget['status'];
  isRead?: boolean;
  expiresAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  items?: CreateBudgetItemData[];
}

// Tipos para filtros y consultas
export interface BudgetFilters {
  status?: Budget['status'];
  customerId?: number;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  isRead?: boolean;
}

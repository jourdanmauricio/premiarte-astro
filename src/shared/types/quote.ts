export interface Quote {
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
  items?: QuoteItem[]; // items del presupuesto (relación)
}

export interface QuoteItem {
  id: number;
  quoteId: number;
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

export interface QuoteFormData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  message?: string;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

// Tipos para crear nuevos presupuestos
export interface CreateQuoteData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  observation?: string;
  userId?: string;
  items: CreateQuoteItemData[];
}

export interface CreateQuoteItemData {
  productId: number;
  sku: string;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  price: number;
  quantity: number;
  observation?: string;
}

// Tipos para filtros y consultas
export interface QuoteFilters {
  status?: Quote['status'];
  email?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  isRead?: boolean;
}

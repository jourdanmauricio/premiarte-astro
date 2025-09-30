export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'wholesale' | 'retail';
  document?: string;
  address?: string;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  type?: 'wholesale' | 'retail';
  document?: string;
  address?: string;
  observation?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  type?: 'wholesale' | 'retail';
  document?: string;
  address?: string;
  observation?: string;
}

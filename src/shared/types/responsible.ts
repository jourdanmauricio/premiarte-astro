export interface Responsible {
  id: number;
  name: string;
  cuit: string;
  condition: string;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResponsibleData {
  name: string;
  cuit: string;
  condition: string;
  observation?: string;
}

export interface UpdateResponsibleData {
  name: string;
  cuit: string;
  condition: string;
  observation?: string;
}

export interface ResponsibleWithBudgetCount extends Responsible {
  budgetCount: number;
}

import { request } from './client';
import type { BudgetResponse } from '../types';

export const budgetApi = {
  get: (month: string) => request<BudgetResponse>(`/budgets/${month}`),

  set: (month: string, amount: number) =>
    request<BudgetResponse>(`/budgets/${month}`, { method: 'PUT', body: { amount } }),
};
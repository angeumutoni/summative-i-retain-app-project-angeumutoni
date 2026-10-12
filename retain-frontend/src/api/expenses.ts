import { request } from './client';
import type {
  ExpenseFilters,
  ExpenseInput,
  ExpenseListResponse,
  ExpenseResponse,
  MessageResponse,
} from '../types';

export const expenseApi = {
  list: (filters: ExpenseFilters) =>
    request<ExpenseListResponse>('/expenses', {
      params: {
        search: filters.search.trim(),
        category: filters.category,
        paymentMethod: filters.paymentMethod,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        sortBy: filters.sortBy,
        order: filters.order,
        page: filters.page,
        limit: filters.limit,
      },
    }),

  get: (id: string) => request<ExpenseResponse>(`/expenses/${id}`),

  create: (input: ExpenseInput) =>
    request<ExpenseResponse>('/expenses', { method: 'POST', body: input }),

  update: (id: string, input: Partial<ExpenseInput>) =>
    request<ExpenseResponse>(`/expenses/${id}`, { method: 'PUT', body: input }),

  remove: (id: string) => request<MessageResponse>(`/expenses/${id}`, { method: 'DELETE' }),
};
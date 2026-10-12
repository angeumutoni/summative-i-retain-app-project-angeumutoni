import { request } from './client';
import type { Category, CategoriesResponse, CategoryResponse, DeleteCategoryResponse } from '../types';

export const categoryApi = {
  list: async (): Promise<Category[]> =>
    (await request<CategoriesResponse>('/categories')).categories,

  create: (name: string) =>
    request<CategoryResponse>('/categories', { method: 'POST', body: { name } }),

  update: (id: string, name: string) =>
    request<CategoryResponse>(`/categories/${id}`, { method: 'PUT', body: { name } }),

  remove: (id: string) => request<DeleteCategoryResponse>(`/categories/${id}`, { method: 'DELETE' }),
};
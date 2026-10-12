import { request } from './client';
import type { Category, CategoriesResponse } from '../types';

export const categoryApi = {
  list: async (): Promise<Category[]> =>
    (await request<CategoriesResponse>('/categories')).categories,
};
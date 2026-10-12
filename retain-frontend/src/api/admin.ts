import { request } from './client';
import type { AdminInsights } from '../types';

export const adminApi = {
  insights: () => request<AdminInsights>('/admin/insights'),
};
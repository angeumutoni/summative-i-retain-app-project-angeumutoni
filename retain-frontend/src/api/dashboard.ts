import { request } from './client';
import type { DashboardData } from '../types';

export const dashboardApi = {
  get: (month: string) => request<DashboardData>('/dashboard', { params: { month } }),
};
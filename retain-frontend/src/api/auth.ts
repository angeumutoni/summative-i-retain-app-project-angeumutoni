import { request } from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),

  me: async (): Promise<User> => (await request<{ user: User }>('/auth/me')).user,
};
const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'retain_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

const hasMessage = (data: unknown): data is { message: string } =>
  typeof data === 'object' &&
  data !== null &&
  'message' in data &&
  typeof data.message === 'string';

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
  }
  const queryString = query.toString();
  const url = `${API_URL}${path}${queryString ? `?${queryString}` : ''}`;

  const token = tokenStorage.get();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler?.();
    throw new ApiRequestError(hasMessage(data) ? data.message : 'Something went wrong', response.status);
  }

  return data as T;
}
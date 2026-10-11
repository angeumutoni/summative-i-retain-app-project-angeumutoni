import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';
import { authApi } from '../api/auth';
import { setUnauthorizedHandler, tokenStorage } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SESSION_RESTORED'; payload: User }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, loading: false };
    case 'SESSION_RESTORED':
      return { ...state, user: action.payload, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
  }
}

// If a token is stored, start in a loading state while we verify it with the server
const initState = (): AuthState => {
  const token = tokenStorage.get();
  return { user: null, token, loading: token !== null };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, initState);

  const logout = useCallback(() => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    tokenStorage.set(data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    tokenStorage.set(data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data.user;
  }, []);

  // Any 401 from the API (expired or invalid token) signs the user out
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restore the session after a page refresh
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;

    authApi
      .me()
      .then((user) => {
        if (!cancelled) dispatch({ type: 'SESSION_RESTORED', payload: user });
      })
      .catch(() => {
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.user !== null,
      isAdmin: state.user?.role === 'admin',
      loading: state.loading,
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
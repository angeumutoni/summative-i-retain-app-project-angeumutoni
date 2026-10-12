import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard';
import type { DashboardData } from '../types';

interface Result {
  key: string;
  data: DashboardData | null;
  error: string;
}

export function useDashboard(month: string) {
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const key = `${month}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false;

    dashboardApi
      .get(month)
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key,
            data: null,
            error: err instanceof Error ? err.message : 'Could not load the dashboard',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month, key]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const loading = result === null || result.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? '' : (result?.error ?? ''),
    loading,
    reload,
  };
}
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import type { AdminInsights } from '../types';

interface Result {
  key: number;
  data: AdminInsights | null;
  error: string;
}

export function useAdminInsights() {
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .insights()
      .then((data) => {
        if (!cancelled) setResult({ key: reloadCount, data, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: reloadCount,
            data: null,
            error: err instanceof Error ? err.message : 'Could not load platform insights',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const loading = result === null || result.key !== reloadCount;

  return {
    data: result?.data ?? null,
    error: loading ? '' : (result?.error ?? ''),
    loading,
    reload,
  };
}
import { useCallback, useEffect, useState } from 'react';
import { categoryApi } from '../api/categories';
import type { Category } from '../types';

interface Result {
  key: number;
  categories: Category[];
  error: string;
}

export function useCategories() {
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    categoryApi
      .list()
      .then((categories) => {
        if (!cancelled) setResult({ key: reloadCount, categories, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: reloadCount,
            categories: [],
            error: err instanceof Error ? err.message : 'Could not load categories',
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
    categories: result?.categories ?? [],
    loading,
    error: loading ? '' : (result?.error ?? ''),
    reload,
  };
}
import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

type Accessor<T> = (item: T) => string | number | boolean | null | undefined;

export function useTableSort<T>(
  data: T[],
  accessors?: Record<string, Accessor<T>>,
  defaultKey?: string,
  defaultDir: SortDirection = 'asc',
) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultDir);

  const toggle = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const accessor = accessors?.[sortKey];
    return [...data].sort((a, b) => {
      const va = accessor ? accessor(a) : (a as Record<string, unknown>)[sortKey];
      const vb = accessor ? accessor(b) : (b as Record<string, unknown>)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return sortDir === 'asc' ? (va === vb ? 0 : va ? -1 : 1) : (va === vb ? 0 : va ? 1 : -1);
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [data, sortKey, sortDir, accessors]);

  return { sortKey, sortDir, toggle, sorted };
}

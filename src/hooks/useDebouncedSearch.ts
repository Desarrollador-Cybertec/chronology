import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/constants/ui';

export function useDebouncedSearch(delay = DEBOUNCE_MS, onDebounce?: () => void) {
  const [search, setSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const callbackRef = useRef(onDebounce);

  useLayoutEffect(() => {
    callbackRef.current = onDebounce;
  });

  useEffect(() => {
    if (search === debouncedValue) return;

    const timer = setTimeout(() => {
      setDebouncedValue(search);
      callbackRef.current?.();
    }, delay);
    return () => clearTimeout(timer);
  }, [search, debouncedValue, delay]);

  return { search, setSearch, debouncedValue } as const;
}

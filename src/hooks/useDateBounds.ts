import { useEffect, useState } from 'react';
import { attendance } from '@/api/endpoints';

interface DateBounds {
  minDate: string;
  maxDate: string;
}

let cached: DateBounds | null = null;
let pending: Promise<DateBounds> | null = null;

function fetchBounds(): Promise<DateBounds> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;

  pending = Promise.all([
    attendance.list({ per_page: 1, sort_by: 'date_reference', order: 'asc' }),
    attendance.list({ per_page: 1, sort_by: 'date_reference', order: 'desc' }),
  ]).then(([oldest, newest]) => {
    const bounds: DateBounds = {
      minDate: oldest.data[0]?.date_reference ?? '',
      maxDate: newest.data[0]?.date_reference ?? '',
    };
    cached = bounds;
    pending = null;
    return bounds;
  }).catch(() => {
    pending = null;
    return { minDate: '', maxDate: '' };
  });

  return pending;
}

export function invalidateDateBounds() {
  cached = null;
  pending = null;
}

export function useDateBounds() {
  const [bounds, setBounds] = useState<DateBounds>(cached ?? { minDate: '', maxDate: '' });

  useEffect(() => {
    fetchBounds().then(setBounds);
  }, []);

  return bounds;
}

import { useEffect, useRef, useState } from 'react';
import { imports } from '@/api/endpoints';
import type { ImportBatch } from '@/types/api';
import { BATCH_STATUS } from '@/constants/api';

const POLL_INTERVAL = 3000;
const COMPLETE_DELAY = 2500;

export function usePollBatch(initial: ImportBatch, onComplete: (batch: ImportBatch) => void) {
  const [batch, setBatch] = useState(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const finished = batch.status === BATCH_STATUS.COMPLETED || batch.status === BATCH_STATUS.FAILED;

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => onComplete(batch), COMPLETE_DELAY);
      return () => clearTimeout(timeout);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const res = await imports.get(batch.id);
        setBatch(res.data);
        if (res.data.status === BATCH_STATUS.COMPLETED || res.data.status === BATCH_STATUS.FAILED) {
          clearInterval(intervalRef.current!);
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return { batch, finished } as const;
}

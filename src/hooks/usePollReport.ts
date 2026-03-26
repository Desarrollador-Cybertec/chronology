import { useEffect, useRef, useState } from 'react';
import { reports } from '@/api/endpoints';
import type { Report } from '@/types/api';
import { BATCH_STATUS } from '@/constants/api';

const POLL_INTERVAL = 3000;
const COMPLETE_DELAY = 2500;

export function usePollReport(initial: Report, onComplete: (report: Report) => void) {
  const [report, setReport] = useState(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const finished = report.status === BATCH_STATUS.COMPLETED || report.status === BATCH_STATUS.FAILED;

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => onComplete(report), COMPLETE_DELAY);
      return () => clearTimeout(timeout);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const res = await reports.get(report.id, false);
        setReport(res.data);
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

  return { report, finished } as const;
}

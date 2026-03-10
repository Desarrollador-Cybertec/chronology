import type { ImportBatch } from '@/types/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { usePollBatch } from '@/hooks/usePollBatch';

interface ProcessingIndicatorProps {
  batch: ImportBatch;
  onComplete: (batch: ImportBatch) => void;
}

export default function ProcessingIndicator({ batch: initial, onComplete }: ProcessingIndicatorProps) {
  const { batch, finished } = usePollBatch(initial, onComplete);

  const progress = batch.total_rows > 0
    ? Math.round((batch.processed_rows / batch.total_rows) * 100)
    : 0;

  return (
    <div className={`rounded-xl border p-5 transition-colors ${
      finished
        ? batch.status === 'completed'
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50'
        : 'border-radar/30 bg-radar/10'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon / Spinner */}
        <div className="shrink-0 pt-0.5">
          {finished ? (
            batch.status === 'completed' ? (
              <HiOutlineCheckCircle className="h-8 w-8 text-emerald-500" />
            ) : (
              <HiOutlineXCircle className="h-8 w-8 text-red-500" />
            )
          ) : (
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="text-radar" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="h-4 w-4 text-gray-400" />
            <span className="truncate text-sm font-medium text-white">{batch.original_filename}</span>
            <StatusBadge status={batch.status} />
          </div>

          {/* Progress bar */}
          {!finished && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  {batch.status === 'pending' ? 'En cola de procesamiento…' : `Procesando filas…`}
                </span>
                <span>{batch.processed_rows} / {batch.total_rows}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-radar/20">
                <div
                  className="h-full rounded-full bg-radar transition-all duration-500"
                  style={{ width: `${Math.max(progress, batch.status === 'pending' ? 0 : 5)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-radar" />
                <span className="text-xs text-radar animate-pulse">
                  {batch.status === 'pending' ? 'Esperando turno en la cola…' : 'Procesando registros de asistencia…'}
                </span>
              </div>
            </div>
          )}

          {/* Completed stats */}
          {batch.status === 'completed' && (
            <div className="mt-2">
              <p className="text-sm text-emerald-700">
                Procesamiento completado — {batch.processed_rows} filas procesadas
                {batch.failed_rows > 0 && <span className="text-red-600"> · {batch.failed_rows} fallidas</span>}
              </p>
            </div>
          )}

          {/* Failed */}
          {batch.status === 'failed' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-red-700">
                Error al procesar — {batch.processed_rows}/{batch.total_rows} filas procesadas
              </p>
              {batch.errors && batch.errors.length > 0 && (
                <p className="text-xs text-red-600">{batch.errors[0]}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

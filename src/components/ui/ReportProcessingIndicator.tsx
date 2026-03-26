import type { Report } from '@/types/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { HiOutlineDocumentChartBar, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { usePollReport } from '@/hooks/usePollReport';

interface ReportProcessingIndicatorProps {
  report: Report;
  onComplete: (report: Report) => void;
}

export default function ReportProcessingIndicator({ report: initial, onComplete }: ReportProcessingIndicatorProps) {
  const { report, finished } = usePollReport(initial, onComplete);

  return (
    <div className={`rounded-xl border p-5 transition-colors ${
      finished
        ? report.status === 'completed'
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50'
        : 'border-radar/30 bg-radar/10'
    }`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 pt-0.5">
          {finished ? (
            report.status === 'completed' ? (
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

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentChartBar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-white">
              Reporte {report.type === 'individual' ? 'individual' : 'general'} — {report.date_from} → {report.date_to}
            </span>
            <StatusBadge status={report.status} />
          </div>

          {!finished && (
            <div className="mt-3">
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-radar/20">
                <div className="h-full w-full animate-pulse rounded-full bg-radar/60" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-radar" />
                <span className="text-xs text-radar animate-pulse">
                  {report.status === 'pending' ? 'Esperando turno en la cola…' : 'Generando reporte de asistencia…'}
                </span>
              </div>
            </div>
          )}

          {report.status === 'completed' && (
            <div className="mt-2">
              <p className="text-sm text-emerald-700">Reporte generado correctamente</p>
            </div>
          )}

          {report.status === 'failed' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-red-700">Error al generar reporte</p>
              {report.error_message && (
                <p className="text-xs text-red-600">{report.error_message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

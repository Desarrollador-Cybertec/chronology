import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { sileo } from 'sileo';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import { reports } from '@/api/endpoints';
import type { Report, ReportSummaryHorasLaborales } from '@/types/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { REPORT_TYPE_BADGE, REPORT_TYPE_LABELS } from '@/utils/reportExports';
import ReportSummarySection from './ReportSummarySection';
import ReportExportButtons from './ReportExportButtons';
import HorasLaboralesTable from './HorasLaboralesTable';
import ReportDetailTable from './ReportDetailTable';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    reports.get(Number(id))
      .then((res) => setReport(res.data))
      .catch(() => sileo.error({ title: 'Error al cargar reporte' }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail rows={8} />;
  if (!report) return <p className="text-gray-400">Reporte no encontrado.</p>;

  const allRows = report.rows ?? [];
  const rows = report.type === 'tardanzas'
    ? allRows.filter((r) => r.status === 'present' && r.late_minutes > 0)
    : allRows;

  return (
    <div>
      <Link to="/reports" className="text-sm text-radar hover:underline">← Reportes</Link>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentChartBar className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Reporte #{report.id}</h2>
          <span className={`ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${REPORT_TYPE_BADGE[report.type]}`}>
            {REPORT_TYPE_LABELS[report.type]}
          </span>
          <StatusBadge status={report.status} />
        </div>
      </div>

      <ReportSummarySection report={report} />

      {rows.length > 0 && <ReportExportButtons report={report} rows={rows} />}

      {report.error_message && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error: {report.error_message}</p>
        </div>
      )}

      {report.type === 'horas_laborales' && (
        <HorasLaboralesTable
          rows={allRows}
          summary={report.summary as ReportSummaryHorasLaborales | undefined}
        />
      )}

      {report.type !== 'horas_laborales' && (
        <ReportDetailTable type={report.type} rows={rows} />
      )}

      <div className="mt-6 text-xs text-gray-500">
        Rango: {report.date_from} → {report.date_to} · Creado: {new Date(report.created_at).toLocaleString()}
        {report.completed_at && ` · Completado: ${new Date(report.completed_at).toLocaleString()}`}
      </div>
    </div>
  );
}

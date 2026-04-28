import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { sileo } from 'sileo';
import { HiOutlineDocumentChartBar, HiOutlineArrowDownTray, HiOutlineEnvelope, HiOutlineEnvelopeOpen } from 'react-icons/hi2';
import { reports } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import type { Report, ReportRow, ReportRowHorasLaborales, ReportSummaryHorasLaborales, ReportSummaryIndividual } from '@/types/api';
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingBatch, setSendingBatch] = useState(false);

  useEffect(() => {
    if (!id) return;
    reports.get(Number(id))
      .then((res) => setReport(res.data))
      .catch(() => sileo.error({ title: 'Error al cargar reporte' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloadingPdf(true);
    try {
      const blob = await reports.download(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const empName = (report.summary as ReportSummaryIndividual | null)?.employee_name ?? `reporte_${report.id}`;
      a.download = `reporte_${empName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string };
        sileo.error({ title: body.message ?? 'No se puede descargar el reporte' });
      } else {
        sileo.error({ title: 'Error al descargar PDF' });
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!report) return;
    setSendingEmail(true);
    try {
      const res = await reports.sendEmail(report.id);
      sileo.success({ title: res.message });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string };
        sileo.error({ title: body.message ?? 'No se puede enviar el correo' });
      } else {
        sileo.error({ title: 'Error al enviar correo' });
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendBatchEmails = async () => {
    if (!report) return;
    setSendingBatch(true);
    try {
      const res = await reports.sendBatchEmails(report.id);
      sileo.success({
        title: res.message,
        description: `Estimado: ~${res.estimated_hours}h para ${res.total_employees} empleados.`,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string };
        sileo.error({ title: body.message ?? 'No se puede enviar los correos' });
      } else {
        sileo.error({ title: 'Error al programar envío masivo' });
      }
    } finally {
      setSendingBatch(false);
    }
  };

  if (loading) return <SkeletonDetail rows={8} />;
  if (!report) return <p className="text-gray-400">Reporte no encontrado.</p>;

  const allRows = report.rows ?? [];
  const rawRows = allRows as ReportRow[];
  const rows = report.type === 'tardanzas'
    ? rawRows.filter((r) => r.status === 'present' && r.late_minutes > 0)
    : rawRows;
  const exportRows = report.type === 'horas_laborales'
    ? (allRows as ReportRowHorasLaborales[])
    : rows;

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

      {report.type === 'individual' && report.status === 'completed' && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-300">Acciones:</span>
          <button
            type="button"
            disabled={downloadingPdf}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            {downloadingPdf ? 'Descargando…' : 'Descargar PDF'}
          </button>
          <button
            type="button"
            disabled={sendingEmail || !report.employee?.email}
            onClick={handleSendEmail}
            title={!report.employee?.email ? 'El empleado no tiene correo registrado' : undefined}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineEnvelope className="h-4 w-4" />
            {sendingEmail ? 'Enviando…' : report.employee?.email ? `Enviar a ${report.employee.email}` : 'Sin correo registrado'}
          </button>
        </div>
      )}

      {report.type === 'general' && report.status === 'completed' && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-300">Acciones:</span>
          <button
            type="button"
            disabled={sendingBatch}
            onClick={handleSendBatchEmails}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineEnvelopeOpen className="h-4 w-4" />
            {sendingBatch ? 'Programando envío…' : 'Enviar reportes por correo'}
          </button>
        </div>
      )}

      {exportRows.length > 0 && <ReportExportButtons report={report} rows={exportRows} />}

      {report.error_message && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error: {report.error_message}</p>
        </div>
      )}

      {report.type === 'horas_laborales' && (
        <HorasLaboralesTable
          rows={allRows as ReportRowHorasLaborales[]}
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

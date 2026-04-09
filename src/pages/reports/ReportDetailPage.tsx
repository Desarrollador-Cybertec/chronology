import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reports } from '@/api/endpoints';
import type {
  Report, ReportType, ReportRow, ReportRowHorasLaborales,
  ReportSummaryIndividual, ReportSummaryGeneral,
  ReportSummaryTardanzas, ReportSummaryIncompletas, ReportSummaryInformeTotal,
  ReportSummaryHorasLaborales,
} from '@/types/api';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  general: 'General',
  individual: 'Individual',
  tardanzas: 'Tardanzas',
  incompletas: 'Incompletas',
  informe_total: 'Informe total',
  horas_laborales: 'Horas laborales',
};

const REPORT_TYPE_BADGE: Record<ReportType, string> = {
  general: 'bg-sky-500/20 text-sky-400',
  individual: 'bg-violet-500/20 text-violet-400',
  tardanzas: 'bg-amber-500/20 text-amber-400',
  incompletas: 'bg-orange-500/20 text-orange-400',
  informe_total: 'bg-rose-500/20 text-rose-400',
  horas_laborales: 'bg-teal-500/20 text-teal-400',
};
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import SortableHeader from '@/components/ui/SortableHeader';
import { formatMinutes } from '@/utils/formatting';
import {
  HiOutlineDocumentChartBar,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';

function buildSheetData(rows: ReportRow[], type: string): (string | number)[][] {
  if (type === 'horas_laborales') {
    const hlRows = rows as unknown as ReportRowHorasLaborales[];
    const headers = ['Código', 'Empleado', 'Departamento', 'Días trabajados', 'Tiempo trabajado'];
    const dataRows = hlRows.map((r) => [
      r.employee_code, r.employee_name, r.department,
      r.days_worked,
      formatMinutes(r.total_worked_minutes),
    ] as (string | number)[]);
    const totals: (string | number)[] = [
      'TOTAL', '', '',
      hlRows.reduce((s, r) => s + r.days_worked, 0),
      formatMinutes(hlRows.reduce((s, r) => s + r.total_worked_minutes, 0)),
    ];
    return [headers, ...dataRows, totals];
  }
  if (type === 'tardanzas') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Tardanza (min)', 'Estado'];
    const dataRows = rows.map((r) => [
      r.employee_code ?? '', r.employee_name ?? '', r.department ?? '',
      r.date, r.first_check_in ?? '', r.late_minutes, r.status,
    ] as (string | number)[]);
    return [headers, ...dataRows];
  }
  if (type === 'incompletas') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Salida', 'Trabajado'];
    const dataRows = rows.map((r) => [
      r.employee_code ?? '', r.employee_name ?? '', r.department ?? '',
      r.date, r.first_check_in ?? '', r.last_check_out ?? '', formatMinutes(r.worked_minutes),
    ] as (string | number)[]);
    return [headers, ...dataRows];
  }
  if (type === 'informe_total') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Salida',
      'Tardanza (min)', 'Salida temp. (min)', 'Trabajado', 'Estado'];
    const dataRows = rows.map((r) => [
      r.employee_code ?? '', r.employee_name ?? '', r.department ?? '',
      r.date, r.first_check_in ?? '', r.last_check_out ?? '',
      r.late_minutes, r.early_departure_minutes, formatMinutes(r.worked_minutes), r.status,
    ] as (string | number)[]);
    return [headers, ...dataRows];
  }

  const isGeneral = type === 'general';
  const headers: string[] = [
    ...(isGeneral ? ['Código', 'Empleado'] : []),
    'Fecha', 'Entrada', 'Salida', 'Trabajado', 'Tardanza',
    'Salida temprana', 'Horas extra', 'HE diurnas', 'HE nocturnas', 'Estado',
  ];
  const dataRows = rows.map((r) => [
    ...(isGeneral ? [r.employee_code ?? '', r.employee_name ?? ''] : []),
    r.date,
    r.first_check_in ?? '',
    r.last_check_out ?? '',
    formatMinutes(r.worked_minutes),
    formatMinutes(r.late_minutes),
    formatMinutes(r.early_departure_minutes),
    formatMinutes(r.overtime_minutes),
    formatMinutes(r.overtime_diurnal_minutes),
    formatMinutes(r.overtime_nocturnal_minutes),
    r.status,
  ] as (string | number)[]);
  return [headers, ...dataRows];
}

function exportToCSV(rows: ReportRow[], type: string, reportName: string) {
  const ws = XLSX.utils.aoa_to_sheet(buildSheetData(rows, type));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToXLSX(rows: ReportRow[], type: string, reportName: string) {
  const ws = XLSX.utils.aoa_to_sheet(buildSheetData(rows, type));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `${reportName}.xlsx`);
}

function exportToPDF(report: Report) {
  const { id, name, type, date_from, date_to, summary, rows = [], completed_at } = report;
  const safeName = name.replace(/[/\\:*?"<>|]/g, '-');
  const isWide = type !== 'individual';
  const doc = new jsPDF({ orientation: isWide ? 'landscape' : 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 14;

  // ── Title block ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Reporte #${id}  ·  ${REPORT_TYPE_LABELS[type]}  ·  Período: ${date_from} → ${date_to}`, 14, y);
  if (completed_at) {
    y += 5;
    doc.text(`Generado: ${new Date(completed_at).toLocaleString('es')}`, 14, y);
  }
  doc.setTextColor(0);
  y += 4;

  // ── Summary block ──
  if (summary) {
    if (type === 'individual') {
      const s = summary as ReportSummaryIndividual;
      y += 4;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Empleado', 14, y);
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${s.employee_name}  (${s.employee_code})`, 14, y);
      y += 4;
    }

    y += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 14, y);
    y += 2;

    let summaryRows: [string, string][];
    if (type === 'individual') {
      const s = summary as ReportSummaryIndividual;
      summaryRows = [
        ['Días totales', String(s.total_days)],
        ['Días presentes', String(s.days_present)],
        ['Días ausentes', String(s.days_absent)],
        ['Días incompletos', String(s.days_incomplete)],
        ['Veces tarde', String(s.times_late)],
        ['Tiempo trabajado', formatMinutes(s.total_worked_minutes)],
        ['Min. tardanza total', formatMinutes(s.total_late_minutes)],
        ['Horas extra', formatMinutes(s.total_overtime_minutes)],
        ['HE diurnas', formatMinutes(s.total_overtime_diurnal_minutes)],
        ['HE nocturnas', formatMinutes(s.total_overtime_nocturnal_minutes)],
        ['Salida temprana', formatMinutes(s.total_early_departure_minutes)],
      ];
    } else if (type === 'general') {
      const s = summary as ReportSummaryGeneral;
      summaryRows = [
        ['Empleados', String(s.total_employees)],
        ['Días totales', String(s.total_days)],
        ['Días presentes', String(s.days_present)],
        ['Días ausentes', String(s.days_absent)],
        ['Días incompletos', String(s.days_incomplete)],
        ['Entradas tarde', String(s.total_late_entries)],
        ['Tiempo trabajado', formatMinutes(s.total_worked_minutes)],
        ['Min. tardanza total', formatMinutes(s.total_late_minutes)],
        ['Horas extra', formatMinutes(s.total_overtime_minutes)],
        ['HE diurnas', formatMinutes(s.total_overtime_diurnal_minutes)],
        ['HE nocturnas', formatMinutes(s.total_overtime_nocturnal_minutes)],
        ['Salida temprana', formatMinutes(s.total_early_departure_minutes)],
      ];
    } else if (type === 'tardanzas') {
      const s = summary as ReportSummaryTardanzas;
      summaryRows = [
        ['Empleados con tardanzas', String(s.total_employees_with_tardanzas)],
        ['Total tardanzas', String(s.total_tardanzas)],
        ['Min. tardanza total', formatMinutes(s.total_late_minutes)],
      ];
    } else if (type === 'incompletas') {
      const s = summary as ReportSummaryIncompletas;
      summaryRows = [
        ['Empleados con incompletas', String(s.total_employees_with_incompletas)],
        ['Total incompletas', String(s.total_incompletas)],
        ['Tiempo trabajado', formatMinutes(s.total_worked_minutes)],
      ];
    } else if (type === 'horas_laborales') {
      const s = summary as ReportSummaryHorasLaborales;
      summaryRows = [
        ['Empleados', String(s.total_employees)],
        ['Tiempo trabajado', formatMinutes(s.total_worked_minutes)],
      ];
    } else {
      const s = summary as ReportSummaryInformeTotal;
      summaryRows = [
        ['Empleados afectados', String(s.total_employees_affected)],
        ['Total registros', String(s.total_records)],
        ['Total tardanzas', String(s.total_tardanzas)],
        ['Salidas temprano', String(s.total_salidas_temprano)],
        ['Total incompletas', String(s.total_incompletas)],
        ['Min. tardanza total', formatMinutes(s.total_late_minutes)],
        ['Min. salida temprana', formatMinutes(s.total_early_departure_minutes)],
      ];
    }

    // Render summary as two-column grid
    const colW = (pageW - 28) / 2;
    autoTable(doc, {
      startY: y + 3,
      head: [['Métrica', 'Valor', 'Métrica', 'Valor']],
      body: (() => {
        const paired: string[][] = [];
        for (let i = 0; i < summaryRows.length; i += 2) {
          paired.push([
            summaryRows[i][0], summaryRows[i][1],
            summaryRows[i + 1]?.[0] ?? '', summaryRows[i + 1]?.[1] ?? '',
          ]);
        }
        return paired;
      })(),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: colW * 0.55 },
        1: { cellWidth: colW * 0.45 },
        2: { fontStyle: 'bold', cellWidth: colW * 0.55 },
        3: { cellWidth: colW * 0.45 },
      },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Detail rows table ──
  if ((rows ?? []).length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle', 14, y);
    y += 2;

    const sheetData = buildSheetData(rows ?? [], type);
    const head = [sheetData[0]];
    const body = sheetData.slice(1).map((r) => r.map((v) => String(v)));

    autoTable(doc, {
      head,
      body,
      startY: y + 3,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`${safeName}.pdf`);
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [hlSortKey, setHlSortKey] = useState<string>('employee_name');
  const [hlSortDir, setHlSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!id) return;
    reports.get(Number(id))
      .then((res) => setReport(res.data))
      .catch(() => sileo.error({ title: 'Error al cargar reporte' }))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleHlSort = (col: string) => {
    if (col === hlSortKey) {
      setHlSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setHlSortKey(col);
      setHlSortDir('asc');
    }
  };
  const hlRows = useMemo<ReportRowHorasLaborales[]>(() => {
    if (!report || report.type !== 'horas_laborales') return [];
    const typed = (report.rows ?? []) as unknown as ReportRowHorasLaborales[];
    return [...typed].sort((a, b) => {
      const va = a[hlSortKey as keyof ReportRowHorasLaborales];
      const vb = b[hlSortKey as keyof ReportRowHorasLaborales];
      if (typeof va === 'number' && typeof vb === 'number') {
        return hlSortDir === 'asc' ? va - vb : vb - va;
      }
      return hlSortDir === 'asc'
        ? String(va ?? '').localeCompare(String(vb ?? ''))
        : String(vb ?? '').localeCompare(String(va ?? ''));
    });
  }, [report, hlSortKey, hlSortDir]);

  if (loading) return <SkeletonDetail rows={8} />;
  if (!report) return <p className="text-gray-400">Reporte no encontrado.</p>;

  const isIndividual = report.type === 'individual';
  const summary = report.summary;
  const rows = report.rows ?? [];

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

      {/* Summary */}
      {summary && (
        <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Resumen</h3>
          {isIndividual && (
            <p className="mb-4 text-sm text-gray-300">
              Empleado: <span className="font-medium text-white">{(summary as ReportSummaryIndividual).employee_name}</span>
              {' '}({(summary as ReportSummaryIndividual).employee_code})
            </p>
          )}
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {report.type === 'individual' && (() => {
              const s = summary as ReportSummaryIndividual;
              return <>
                <SummaryCard label="Días totales" value={s.total_days} />
                <SummaryCard label="Presentes" value={s.days_present} color="text-emerald-400" />
                <SummaryCard label="Ausentes" value={s.days_absent} color="text-red-400" />
                <SummaryCard label="Incompletos" value={s.days_incomplete} color="text-amber-400" />
                <SummaryCard label="Veces tarde" value={s.times_late} color="text-amber-400" />
                <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
                <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
                <SummaryCard label="Horas extra" value={formatMinutes(s.total_overtime_minutes)} color="text-sky-400" />
                <SummaryCard label="HE diurnas" value={formatMinutes(s.total_overtime_diurnal_minutes)} />
                <SummaryCard label="HE nocturnas" value={formatMinutes(s.total_overtime_nocturnal_minutes)} />
                <SummaryCard label="Salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
              </>;
            })()}
            {report.type === 'general' && (() => {
              const s = summary as ReportSummaryGeneral;
              return <>
                <SummaryCard label="Empleados" value={s.total_employees} />
                <SummaryCard label="Días totales" value={s.total_days} />
                <SummaryCard label="Presentes" value={s.days_present} color="text-emerald-400" />
                <SummaryCard label="Ausentes" value={s.days_absent} color="text-red-400" />
                <SummaryCard label="Incompletos" value={s.days_incomplete} color="text-amber-400" />
                <SummaryCard label="Entradas tarde" value={s.total_late_entries} color="text-amber-400" />
                <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
                <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
                <SummaryCard label="Horas extra" value={formatMinutes(s.total_overtime_minutes)} color="text-sky-400" />
                <SummaryCard label="HE diurnas" value={formatMinutes(s.total_overtime_diurnal_minutes)} />
                <SummaryCard label="HE nocturnas" value={formatMinutes(s.total_overtime_nocturnal_minutes)} />
                <SummaryCard label="Salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
              </>;
            })()}
            {report.type === 'tardanzas' && (() => {
              const s = summary as ReportSummaryTardanzas;
              return <>
                <SummaryCard label="Empleados con tardanzas" value={s.total_employees_with_tardanzas} />
                <SummaryCard label="Total tardanzas" value={s.total_tardanzas} color="text-amber-400" />
                <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
              </>;
            })()}
            {report.type === 'incompletas' && (() => {
              const s = summary as ReportSummaryIncompletas;
              return <>
                <SummaryCard label="Empleados con incompletas" value={s.total_employees_with_incompletas} />
                <SummaryCard label="Total incompletas" value={s.total_incompletas} color="text-orange-400" />
                <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
              </>;
            })()}
            {report.type === 'informe_total' && (() => {
              const s = summary as ReportSummaryInformeTotal;
              return <>
                <SummaryCard label="Empleados afectados" value={s.total_employees_affected} />
                <SummaryCard label="Total registros" value={s.total_records} />
                <SummaryCard label="Total tardanzas" value={s.total_tardanzas} color="text-amber-400" />
                <SummaryCard label="Salidas temprano" value={s.total_salidas_temprano} color="text-amber-400" />
                <SummaryCard label="Total incompletas" value={s.total_incompletas} color="text-orange-400" />
                <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
                <SummaryCard label="Min. salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
              </>;
            })()}
            {report.type === 'horas_laborales' && (() => {
              const s = summary as ReportSummaryHorasLaborales;
              return <>
                <SummaryCard label="Empleados" value={s.total_employees} />
                <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
              </>;
            })()}
          </dl>
        </div>
      )}

      {/* Export buttons */}
      {rows.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-300">Exportar:</span>
          <button
            type="button"
            onClick={() => exportToCSV(rows, report.type, report.name)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-grafito px-4 py-2 text-sm font-medium text-white transition hover:bg-grafito-lighter cursor-pointer"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> CSV
          </button>
          <button
            type="button"
            onClick={() => exportToXLSX(rows, report.type, report.name)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => exportToPDF(report)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 cursor-pointer"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> PDF
          </button>
        </div>
      )}

      {/* Error */}
      {report.error_message && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Error: {report.error_message}</p>
        </div>
      )}

      {/* Horas laborales table */}
      {report.type === 'horas_laborales' && hlRows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
                <SortableHeader label="Código" column="employee_code" sortKey={hlSortKey} sortDir={hlSortDir} onSort={toggleHlSort} />
                <SortableHeader label="Empleado" column="employee_name" sortKey={hlSortKey} sortDir={hlSortDir} onSort={toggleHlSort} />
                <SortableHeader label="Departamento" column="department" sortKey={hlSortKey} sortDir={hlSortDir} onSort={toggleHlSort} />
                <SortableHeader label="Días trabajados" column="days_worked" sortKey={hlSortKey} sortDir={hlSortDir} onSort={toggleHlSort} />
                <SortableHeader label="Tiempo trabajado" column="total_worked_minutes" sortKey={hlSortKey} sortDir={hlSortDir} onSort={toggleHlSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {hlRows.map((row, i) => (
                <tr key={i} className="hover:bg-grafito-lighter">
                  <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
                  <td className="px-4 py-3 text-gray-300">{row.department || '—'}</td>
                  <td className="px-4 py-3">{row.days_worked}</td>
                  <td className="px-4 py-3">{formatMinutes(row.total_worked_minutes)}</td>
                </tr>
              ))}
              {summary && (() => {
                const s = summary as ReportSummaryHorasLaborales;
                return (
                  <tr className="border-t border-white/20 bg-navy/40 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-sm text-gray-300">
                      Totales ({s.total_employees} empleados)
                    </td>
                    <td className="px-4 py-3 text-gray-500">—</td>
                    <td className="px-4 py-3">{formatMinutes(s.total_worked_minutes)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail rows */}
      {report.type !== 'horas_laborales' && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
                {report.type === 'tardanzas' && <>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Tardanza</th>
                  <th className="px-4 py-3">Estado</th>
                </>}
                {report.type === 'incompletas' && <>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Trabajado</th>
                </>}
                {report.type === 'informe_total' && <>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Tardanza</th>
                  <th className="px-4 py-3">Salida temp.</th>
                  <th className="px-4 py-3">Trabajado</th>
                  <th className="px-4 py-3">Estado</th>
                </>}
                {(report.type === 'individual' || report.type === 'general') && <>
                  {!isIndividual && <>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Empleado</th>
                  </>}
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Trabajado</th>
                  <th className="px-4 py-3">Tardanza</th>
                  <th className="px-4 py-3">Salida temp.</th>
                  <th className="px-4 py-3">HE</th>
                  <th className="px-4 py-3">Estado</th>
                </>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-grafito-lighter">
                  {report.type === 'tardanzas' && <>
                    <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
                    <td className="px-4 py-3 text-gray-300">{row.department ?? '—'}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
                    <td className="px-4 py-3 text-amber-400 font-medium">{formatMinutes(row.late_minutes)}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  </>}
                  {report.type === 'incompletas' && <>
                    <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
                    <td className="px-4 py-3 text-gray-300">{row.department ?? '—'}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{row.last_check_out ?? '—'}</td>
                    <td className="px-4 py-3">{formatMinutes(row.worked_minutes)}</td>
                  </>}
                  {report.type === 'informe_total' && <>
                    <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
                    <td className="px-4 py-3 text-gray-300">{row.department ?? '—'}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{row.last_check_out ?? '—'}</td>
                    <td className={`px-4 py-3 ${row.late_minutes > 0 ? 'text-amber-400 font-medium' : ''}`}>
                      {row.late_minutes > 0 ? formatMinutes(row.late_minutes) : '—'}
                    </td>
                    <td className={`px-4 py-3 ${row.early_departure_minutes > 0 ? 'text-amber-400' : ''}`}>
                      {row.early_departure_minutes > 0 ? formatMinutes(row.early_departure_minutes) : '—'}
                    </td>
                    <td className="px-4 py-3">{formatMinutes(row.worked_minutes)}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  </>}
                  {(report.type === 'individual' || report.type === 'general') && <>
                    {!isIndividual && <>
                      <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
                      <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
                    </>}
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{row.last_check_out ?? '—'}</td>
                    <td className="px-4 py-3">{formatMinutes(row.worked_minutes)}</td>
                    <td className={`px-4 py-3 ${row.late_minutes > 0 ? 'text-amber-400 font-medium' : ''}`}>
                      {row.late_minutes > 0 ? formatMinutes(row.late_minutes) : '—'}
                    </td>
                    <td className={`px-4 py-3 ${row.early_departure_minutes > 0 ? 'text-amber-400' : ''}`}>
                      {row.early_departure_minutes > 0 ? formatMinutes(row.early_departure_minutes) : '—'}
                    </td>
                    <td className={`px-4 py-3 ${row.overtime_minutes > 0 ? 'text-sky-400' : ''}`}>
                      {row.overtime_minutes > 0 ? formatMinutes(row.overtime_minutes) : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Meta info */}
      <div className="mt-6 text-xs text-gray-500">
        Rango: {report.date_from} → {report.date_to} · Creado: {new Date(report.created_at).toLocaleString()}
        {report.completed_at && ` · Completado: ${new Date(report.completed_at).toLocaleString()}`}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-white/5 bg-navy/40 px-4 py-3">
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className={`text-sm font-semibold ${color ?? 'text-white'}`}>{value}</dd>
    </div>
  );
}

import { formatMinutes } from '@/utils/formatting';
import type {
  Report, ReportRow, ReportRowHorasLaborales,
  ReportSummaryIndividual, ReportSummaryGeneral,
  ReportSummaryTardanzas, ReportSummaryIncompletas, ReportSummaryInformeTotal,
  ReportSummaryHorasLaborales,
} from '@/types/api';

export const REPORT_TYPE_LABELS = {
  general: 'General',
  individual: 'Individual',
  tardanzas: 'Tardanzas',
  incompletas: 'Incompletas',
  informe_total: 'Informe total',
  horas_laborales: 'Horas laborales',
} as const;

export const REPORT_TYPE_BADGE = {
  general: 'bg-sky-500/20 text-sky-400',
  individual: 'bg-violet-500/20 text-violet-400',
  tardanzas: 'bg-amber-500/20 text-amber-400',
  incompletas: 'bg-orange-500/20 text-orange-400',
  informe_total: 'bg-rose-500/20 text-rose-400',
  horas_laborales: 'bg-teal-500/20 text-teal-400',
} as const;

export function buildSheetData(rows: (ReportRow | ReportRowHorasLaborales)[], type: string): (string | number)[][] {
  if (type === 'horas_laborales') {
    const hlRows = (rows as ReportRowHorasLaborales[]).sort((a, b) => Number(a.employee_code) - Number(b.employee_code));
    const headers = ['Código', 'Empleado', 'Departamento', 'Días trabajados', 'Ausencias', 'Incompletos', 'Tiempo trabajado'];
    const dataRows = hlRows.map((r) => [
      r.employee_code, r.employee_name, r.department,
      r.days_worked, r.days_absent, r.days_incomplete,
      formatMinutes(r.total_worked_minutes),
    ] as (string | number)[]);
    const totals: (string | number)[] = [
      'TOTAL', '', '',
      hlRows.reduce((s, r) => s + r.days_worked, 0),
      hlRows.reduce((s, r) => s + r.days_absent, 0),
      hlRows.reduce((s, r) => s + r.days_incomplete, 0),
      formatMinutes(hlRows.reduce((s, r) => s + r.total_worked_minutes, 0)),
    ];
    return [headers, ...dataRows, totals];
  }

  // All remaining types use raw per-day ReportRow fields
  const rawRows = rows as ReportRow[];

  if (type === 'tardanzas') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Tardanza (min)', 'Estado'];
    const dataRows = rawRows.map((r) => [
      r.employee_code ?? '', r.employee_name ?? '', r.department ?? '',
      r.date, r.first_check_in ?? '', r.late_minutes, r.status,
    ] as (string | number)[]);
    return [headers, ...dataRows];
  }
  if (type === 'incompletas') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Salida', 'Trabajado'];
    const dataRows = rawRows.map((r) => [
      r.employee_code ?? '', r.employee_name ?? '', r.department ?? '',
      r.date, r.first_check_in ?? '', r.last_check_out ?? '', formatMinutes(r.worked_minutes),
    ] as (string | number)[]);
    return [headers, ...dataRows];
  }
  if (type === 'informe_total') {
    const headers = ['Código', 'Empleado', 'Departamento', 'Fecha', 'Entrada', 'Salida',
      'Tardanza (min)', 'Salida temp. (min)', 'Trabajado', 'Estado'];
    const dataRows = rawRows.map((r) => [
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
  const dataRows = rawRows.map((r) => [
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

export async function exportToCSV(rows: (ReportRow | ReportRowHorasLaborales)[], type: string, reportName: string) {
  const XLSX = await import('xlsx');
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

export async function exportToXLSX(rows: (ReportRow | ReportRowHorasLaborales)[], type: string, reportName: string) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(buildSheetData(rows, type));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `${reportName}.xlsx`);
}

export async function exportToPDF(report: Report, filteredRows?: (ReportRow | ReportRowHorasLaborales)[]) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const { id, name, type, date_from, date_to, summary, completed_at } = report;
  const rows: (ReportRow | ReportRowHorasLaborales)[] = filteredRows ?? report.rows ?? [];
  const safeName = name.replace(/[/\\:*?"<>|]/g, '-');
  const isWide = type !== 'individual';
  const doc = new jsPDF({ orientation: isWide ? 'landscape' : 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Reporte #${id}  |  ${REPORT_TYPE_LABELS[type]}  |  Periodo: ${date_from} - ${date_to}`, 14, y);
  if (completed_at) {
    y += 5;
    doc.text(`Generado: ${new Date(completed_at).toLocaleString('es')}`, 14, y);
  }
  doc.setTextColor(0);
  y += 4;

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

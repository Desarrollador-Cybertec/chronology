import { useState } from 'react';
import { sileo } from 'sileo';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import type { Report, ReportRow, ReportRowHorasLaborales } from '@/types/api';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/reportExports';

type Format = 'csv' | 'xlsx' | 'pdf';

interface Props {
  report: Report;
  rows: (ReportRow | ReportRowHorasLaborales)[];
}

export default function ReportExportButtons({ report, rows }: Props) {
  const [busy, setBusy] = useState<Format | null>(null);

  const run = async (fmt: Format, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(fmt);
    try {
      await fn();
    } catch {
      sileo.error({ title: 'Error al exportar el reporte' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-300">Exportar:</span>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run('csv', () => exportToCSV(rows, report.type, report.name))}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-grafito px-4 py-2 text-sm font-medium text-white transition hover:bg-grafito-lighter cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlineArrowDownTray className="h-4 w-4" /> {busy === 'csv' ? 'Generando…' : 'CSV'}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run('xlsx', () => exportToXLSX(rows, report.type, report.name))}
        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlineArrowDownTray className="h-4 w-4" /> {busy === 'xlsx' ? 'Generando…' : 'Excel (.xlsx)'}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run('pdf', () => exportToPDF(report, rows))}
        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlineArrowDownTray className="h-4 w-4" /> {busy === 'pdf' ? 'Generando…' : 'PDF'}
      </button>
    </div>
  );
}

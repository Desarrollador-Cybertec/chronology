import { useMemo, useState } from 'react';
import SortableHeader from '@/components/ui/SortableHeader';
import { formatMinutes } from '@/utils/formatting';
import type {
  ReportRowHorasLaborales,
  ReportSummaryHorasLaborales,
} from '@/types/api';

interface Props {
  rows: ReportRowHorasLaborales[];
  summary?: ReportSummaryHorasLaborales;
}

export default function HorasLaboralesTable({ rows, summary }: Props) {
  const [sortKey, setSortKey] = useState<string>('employee_code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const hlRows = useMemo<ReportRowHorasLaborales[]>(() => {
    return [...rows].sort((a, b) => {
      const va = a[sortKey as keyof ReportRowHorasLaborales];
      const vb = b[sortKey as keyof ReportRowHorasLaborales];
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const na = Number(va), nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) {
        return sortDir === 'asc' ? na - nb : nb - na;
      }
      return sortDir === 'asc'
        ? String(va ?? '').localeCompare(String(vb ?? ''))
        : String(vb ?? '').localeCompare(String(va ?? ''));
    });
  }, [rows, sortKey, sortDir]);

  const toggleSort = (col: string) => {
    if (col === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  };

  if (hlRows.length === 0) return null;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
            <SortableHeader label="Código" column="employee_code" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Empleado" column="employee_name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Departamento" column="department" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Días trabajados" column="days_worked" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Ausencias" column="days_absent" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Incompletos" column="days_incomplete" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Tiempo trabajado" column="total_worked_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {hlRows.map((row, i) => (
            <tr key={i} className="hover:bg-grafito-lighter">
              <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
              <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
              <td className="px-4 py-3 text-gray-300">{row.department || '—'}</td>
              <td className="px-4 py-3 text-emerald-400 font-medium">{row.days_worked}</td>
              <td className={`px-4 py-3 ${row.days_absent > 0 ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                {row.days_absent > 0 ? row.days_absent : '—'}
              </td>
              <td className={`px-4 py-3 ${row.days_incomplete > 0 ? 'text-amber-400 font-medium' : 'text-gray-400'}`}>
                {row.days_incomplete > 0 ? row.days_incomplete : '—'}
              </td>
              <td className="px-4 py-3">{formatMinutes(row.total_worked_minutes)}</td>
            </tr>
          ))}
          {summary && (
            <tr className="border-t border-white/20 bg-navy/40 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-300">
                Totales ({summary.total_employees} empleados)
              </td>
              <td className="px-4 py-3 text-gray-500">—</td>
              <td className="px-4 py-3 text-gray-500">—</td>
              <td className="px-4 py-3 text-gray-500">—</td>
              <td className="px-4 py-3">{formatMinutes(summary.total_worked_minutes)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

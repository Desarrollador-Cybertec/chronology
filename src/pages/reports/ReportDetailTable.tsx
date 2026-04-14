import StatusBadge from '@/components/ui/StatusBadge';
import { formatMinutes } from '@/utils/formatting';
import type { ReportRow, ReportType } from '@/types/api';

interface Props {
  type: ReportType;
  rows: ReportRow[];
}

export default function ReportDetailTable({ type, rows }: Props) {
  if (type === 'horas_laborales' || rows.length === 0) return null;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
            {type === 'tardanzas' && <TardanzasHeader />}
            {type === 'incompletas' && <IncompletasHeader />}
            {type === 'informe_total' && <InformeTotalHeader />}
            {(type === 'individual' || type === 'general') && <AttendanceHeader isIndividual={type === 'individual'} />}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-grafito-lighter">
              {type === 'tardanzas' && <TardanzasRow row={row} />}
              {type === 'incompletas' && <IncompletasRow row={row} />}
              {type === 'informe_total' && <InformeTotalRow row={row} />}
              {(type === 'individual' || type === 'general') && (
                <AttendanceRow row={row} isIndividual={type === 'individual'} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TardanzasHeader() {
  return (
    <>
      <th className="px-4 py-3">Código</th>
      <th className="px-4 py-3">Empleado</th>
      <th className="px-4 py-3">Departamento</th>
      <th className="px-4 py-3">Fecha</th>
      <th className="px-4 py-3">Entrada</th>
      <th className="px-4 py-3">Tardanza</th>
      <th className="px-4 py-3">Estado</th>
    </>
  );
}

function TardanzasRow({ row }: { row: ReportRow }) {
  return (
    <>
      <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
      <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
      <td className="px-4 py-3 text-gray-300">{row.department ?? '—'}</td>
      <td className="px-4 py-3">{row.date}</td>
      <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
      <td className="px-4 py-3 text-amber-400 font-medium">{formatMinutes(row.late_minutes)}</td>
      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
    </>
  );
}

function IncompletasHeader() {
  return (
    <>
      <th className="px-4 py-3">Código</th>
      <th className="px-4 py-3">Empleado</th>
      <th className="px-4 py-3">Departamento</th>
      <th className="px-4 py-3">Fecha</th>
      <th className="px-4 py-3">Entrada</th>
      <th className="px-4 py-3">Salida</th>
      <th className="px-4 py-3">Trabajado</th>
    </>
  );
}

function IncompletasRow({ row }: { row: ReportRow }) {
  return (
    <>
      <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
      <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
      <td className="px-4 py-3 text-gray-300">{row.department ?? '—'}</td>
      <td className="px-4 py-3">{row.date}</td>
      <td className="px-4 py-3 text-gray-300">{row.first_check_in ?? '—'}</td>
      <td className="px-4 py-3 text-gray-300">{row.last_check_out ?? '—'}</td>
      <td className="px-4 py-3">{formatMinutes(row.worked_minutes)}</td>
    </>
  );
}

function InformeTotalHeader() {
  return (
    <>
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
    </>
  );
}

function InformeTotalRow({ row }: { row: ReportRow }) {
  return (
    <>
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
    </>
  );
}

function AttendanceHeader({ isIndividual }: { isIndividual: boolean }) {
  return (
    <>
      {!isIndividual && (
        <>
          <th className="px-4 py-3">Código</th>
          <th className="px-4 py-3">Empleado</th>
        </>
      )}
      <th className="px-4 py-3">Fecha</th>
      <th className="px-4 py-3">Entrada</th>
      <th className="px-4 py-3">Salida</th>
      <th className="px-4 py-3">Trabajado</th>
      <th className="px-4 py-3">Tardanza</th>
      <th className="px-4 py-3">Salida temp.</th>
      <th className="px-4 py-3">HE</th>
      <th className="px-4 py-3">Estado</th>
    </>
  );
}

function AttendanceRow({ row, isIndividual }: { row: ReportRow; isIndividual: boolean }) {
  return (
    <>
      {!isIndividual && (
        <>
          <td className="px-4 py-3 text-gray-300">{row.employee_code}</td>
          <td className="px-4 py-3 font-medium text-white">{row.employee_name}</td>
        </>
      )}
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
    </>
  );
}

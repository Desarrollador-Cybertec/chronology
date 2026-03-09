import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { attendance } from '@/api/endpoints';
import type { AttendanceRecord, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import { useTableSort } from '@/hooks/useTableSort';
import SortableHeader from '@/components/ui/SortableHeader';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineFunnel,
  HiOutlineEye,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import { SkeletonTable } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { attendanceListSteps, attendanceListAdminSteps } from '@/data/pageTutorials';

const inputBase = 'rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AttendanceListPage() {
  const { isSuperadmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const attAccessors = useMemo(() => ({
    date_reference: (r: AttendanceRecord) => r.date_reference,
    employee: (r: AttendanceRecord) => `${r.employee.first_name} ${r.employee.last_name}`,
    shift: (r: AttendanceRecord) => r.shift?.name ?? '',
    first_check_in: (r: AttendanceRecord) => r.first_check_in ?? '',
    last_check_out: (r: AttendanceRecord) => r.last_check_out ?? '',
    worked_minutes: (r: AttendanceRecord) => r.worked_minutes,
    late_minutes: (r: AttendanceRecord) => r.late_minutes,
    overtime_minutes: (r: AttendanceRecord) => r.overtime_minutes,
    status: (r: AttendanceRecord) => r.status,
  }), []);
  const { sortKey, sortDir, toggle, sorted } = useTableSort(data, attAccessors);

  const [employeeId, setEmployeeId] = useState(searchParams.get('employee_id') ?? '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [page, _setPage] = useState(Number(searchParams.get('page') ?? 1));

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  const fetchData = useCallback(() => {
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (employeeId) params.employee_id = employeeId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (status) params.status = status;

    attendance.list(params)
      .then((res) => { setData(res.data); setMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar asistencia' }))
      .finally(() => setLoading(false));
  }, [page, employeeId, dateFrom, dateTo, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilters = () => {
    setLoading(true);
    setPage(1);
    const params = new URLSearchParams();
    if (employeeId) params.set('employee_id', employeeId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineClipboardDocumentCheck className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Asistencia</h2>
        </div>
        <TutorialModal steps={isSuperadmin ? attendanceListAdminSteps : attendanceListSteps} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <input type="number" placeholder="ID empleado" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={`${inputBase} w-32`} />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputBase} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputBase} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputBase}>
          <option value="">Todos los estados</option>
          <option value="present">Presente</option>
          <option value="absent">Ausente</option>
          <option value="incomplete">Incompleto</option>
          <option value="rest">Descanso</option>
          <option value="holiday">Feriado</option>
        </select>
        <button className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer" onClick={applyFilters}><HiOutlineFunnel className="h-4 w-4" /> Filtrar</button>
      </div>

      {loading ? (
        <SkeletonTable cols={10} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="Fecha" column="date_reference" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Empleado" column="employee" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Turno" column="shift" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Entrada" column="first_check_in" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Salida" column="last_check_out" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Trabajado" column="worked_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Tardanza" column="late_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="HE" column="overtime_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Estado" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((rec) => (
                  <tr key={rec.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3">{rec.date_reference}</td>
                    <td className="px-4 py-3">
                      <Link to={`/employees/${rec.employee_id}`} className="font-medium text-radar hover:underline">
                        {rec.employee.first_name} {rec.employee.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{rec.shift?.name ?? '—'}</td>
                    <td className="px-4 py-3">{rec.first_check_in?.split(' ')[1] ?? '—'}</td>
                    <td className="px-4 py-3">{rec.last_check_out?.split(' ')[1] ?? '—'}</td>
                    <td className="px-4 py-3">{formatMinutes(rec.worked_minutes)}</td>
                    <td className={`px-4 py-3 ${rec.late_minutes > 0 ? 'text-red-600 font-medium' : ''}`}>
                      {rec.late_minutes > 0 ? formatMinutes(rec.late_minutes) : '—'}
                    </td>
                    <td className={`px-4 py-3 ${rec.overtime_minutes > 0 ? 'text-emerald-600 font-medium' : ''}`}>
                      {rec.overtime_minutes > 0 ? formatMinutes(rec.overtime_minutes) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                      {rec.is_manually_edited && <span className="ml-1 text-gray-400" title="Editado manualmente">✎</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/attendance/${rec.id}`} className="flex items-center gap-1 text-sm text-radar hover:underline"><HiOutlineEye className="h-4 w-4" /> Ver</Link>
                        {isSuperadmin && (
                          <Link to={`/attendance/${rec.id}/edit`} className="flex items-center gap-1 text-sm text-radar hover:underline"><HiOutlinePencilSquare className="h-4 w-4" /> Editar</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-400">No se encontraron registros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { attendance, employees as employeesApi } from '@/api/endpoints';
import type { AttendanceRecord, Employee, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
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
import { INPUT_BASE } from '@/constants/ui';
import { formatMinutes } from '@/utils/formatting';

export default function AttendanceListPage() {
  const { isSuperadmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<string>('date_reference');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Employee options for the select
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);

  // Input state — bound to the filter fields (not used for fetching directly)
  const initialInternalId = searchParams.get('employee_internal_id') ?? '';
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');

  // True while we're resolving the initial employee_internal_id from the URL
  const [initializing, setInitializing] = useState(true);

  // Committed state — holds resolved database IDs; only updated on "Filtrar"
  const [committed, setCommitted] = useState({
    employeeId: '',
    dateFrom: searchParams.get('date_from') ?? '',
    dateTo: searchParams.get('date_to') ?? '',
    status: searchParams.get('status') ?? '',
  });

  const [page, _setPage] = useState(Number(searchParams.get('page') ?? 1));

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  const toggleSort = useCallback((column: string) => {
    setSortDir(prev => sortKey === column ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(column);
    _setPage(1);
  }, [sortKey]);

  const fetchData = useCallback(() => {
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (committed.employeeId) params.employee_id = committed.employeeId;
    if (committed.dateFrom) params.date_from = committed.dateFrom;
    if (committed.dateTo) params.date_to = committed.dateTo;
    if (committed.status) params.status = committed.status;
    if (sortKey) params.sort_by = sortKey;
    if (sortDir) params.order = sortDir;

    attendance.list(params)
      .then((res) => { setData(res.data); setMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar asistencia' }))
      .finally(() => setLoading(false));
  }, [page, committed, sortKey, sortDir]);

  // Fetch employee options and resolve initial filter on first mount
  useEffect(() => {
    employeesApi.list(1, undefined, 'internal_id', 'asc', 1000)
      .then(res => {
        setEmployeeOptions(res.data);
        if (initialInternalId) {
          const match = res.data.find(e => e.internal_id === initialInternalId);
          if (match) {
            setSelectedEmployeeId(String(match.id));
            setCommitted(prev => ({ ...prev, employeeId: String(match.id) }));
          } else {
            sileo.error({ title: `No se encontró empleado con ID interno "${initialInternalId}"` });
          }
        }
      })
      .catch(() => sileo.error({ title: 'Error al cargar empleados' }))
      .finally(() => setInitializing(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initializing) fetchData();
  }, [fetchData, initializing]);

  const applyFilters = () => {
    setLoading(true);
    _setPage(1);
    setCommitted({ employeeId: selectedEmployeeId, dateFrom, dateTo, status });
    const params = new URLSearchParams();
    if (selectedEmployeeId) {
      const emp = employeeOptions.find(e => String(e.id) === selectedEmployeeId);
      if (emp) params.set('employee_internal_id', emp.internal_id);
    }
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
        <div className="w-52">
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className={INPUT_BASE}>
            <option value="">Todos los empleados</option>
            {employeeOptions.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>{emp.internal_id} — {emp.first_name} {emp.last_name}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={INPUT_BASE} />
        </div>
        <div className="w-40">
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={INPUT_BASE} />
        </div>
        <div className="w-44">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT_BASE}>
            <option value="">Todos los estados</option>
            <option value="present">Presente</option>
            <option value="absent">Ausente</option>
            <option value="incomplete">Incompleto</option>
            <option value="rest">Descanso</option>
            <option value="holiday">Feriado</option>
          </select>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer" onClick={applyFilters}><HiOutlineFunnel className="h-4 w-4" /> Filtrar</button>
      </div>

      {loading ? (
          <SkeletonTable cols={9} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="Fecha" column="date_reference" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Empleado" column="employee" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />

                  <SortableHeader label="Entrada" column="first_check_in" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Salida" column="last_check_out" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Trabajado" column="worked_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Tardanza" column="late_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="HE" column="overtime_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Estado" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((rec) => (
                  <tr key={rec.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3">{rec.date_reference}</td>
                    <td className="px-4 py-3">
                      <Link to={`/employees/${rec.employee_id}`} className="font-medium text-radar hover:underline">
                        {rec.employee.first_name} {rec.employee.last_name}
                      </Link>
                    </td>

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
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No se encontraron registros.</td>
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

import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { attendance } from '@/api/endpoints';
import type { AttendanceRecord, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';

const inputBase = 'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500';

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
      <h2 className="text-2xl font-bold text-gray-900">Asistencia</h2>

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
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer" onClick={applyFilters}>Filtrar</button>
      </div>

      {loading ? (
        <p className="mt-4 text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Turno</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Trabajado</th>
                  <th className="px-4 py-3">Tardanza</th>
                  <th className="px-4 py-3">HE</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{rec.date_reference}</td>
                    <td className="px-4 py-3">
                      <Link to={`/employees/${rec.employee_id}`} className="font-medium text-indigo-600 hover:underline">
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
                        <Link to={`/attendance/${rec.id}`} className="text-sm text-indigo-600 hover:underline">Ver</Link>
                        {isSuperadmin && (
                          <Link to={`/attendance/${rec.id}/edit`} className="text-sm text-indigo-600 hover:underline">Editar</Link>
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

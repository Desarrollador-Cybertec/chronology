import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { scheduleExceptions, employees } from '@/api/endpoints';
import type { ScheduleException, Employee, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { sileo } from 'sileo';
import { SkeletonTable } from '@/components/ui/Skeleton';
import {
  HiOutlineCalendarDays,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';

const inputBase = 'rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

export default function ScheduleExceptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ScheduleException[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(Number(searchParams.get('page') ?? 1));

  // Filter state
  const [employeeId, setEmployeeId] = useState(searchParams.get('employee_id') ?? '');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formIsWorkingDay, setFormIsWorkingDay] = useState(false);
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  const fetchData = useCallback(() => {
    if (!employeeId) {
      setData([]);
      setMeta(null);
      setLoading(false);
      return;
    }
    scheduleExceptions.listByEmployee(Number(employeeId), { page, per_page: 15 })
      .then((res) => { setData(res.data); setMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar excepciones' }))
      .finally(() => setLoading(false));
  }, [page, employeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilter = () => {
    setLoading(true);
    _setPage(1);
    const params = new URLSearchParams();
    if (employeeId) params.set('employee_id', employeeId);
    setSearchParams(params);
  };

  // Search employees for modal
  const searchEmployees = useCallback(async (query: string) => {
    if (query.length < 2) { setEmployeeResults([]); return; }
    try {
      const res = await employees.list(1, query);
      setEmployeeResults(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => { searchEmployees(employeeSearch); }, 300);
    return () => clearTimeout(timeout);
  }, [employeeSearch, searchEmployees]);

  const handleCreate = async () => {
    if (!selectedEmployee || !formDate) {
      sileo.error({ title: 'Completa empleado y fecha' });
      return;
    }
    setSubmitting(true);
    try {
      await scheduleExceptions.create({
        employee_id: selectedEmployee.id,
        date: formDate,
        is_working_day: formIsWorkingDay,
        reason: formReason || undefined,
      });
      sileo.success({ title: 'Excepción creada' });
      setShowModal(false);
      resetForm();
      // Refresh if same employee
      if (String(selectedEmployee.id) === employeeId) fetchData();
    } catch {
      sileo.error({ title: 'Error al crear excepción' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta excepción de horario?')) return;
    try {
      await scheduleExceptions.delete(id);
      setData((prev) => prev.filter((e) => e.id !== id));
      sileo.success({ title: 'Excepción eliminada' });
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setEmployeeSearch('');
    setEmployeeResults([]);
    setFormDate('');
    setFormIsWorkingDay(false);
    setFormReason('');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineCalendarDays className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Excepciones de horario</h2>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <HiOutlinePlusCircle className="h-4 w-4" /> Nueva excepción
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <input
          type="number"
          placeholder="ID empleado"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`${inputBase} w-40`}
        />
        <button
          className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
          onClick={applyFilter}
        >
          Buscar
        </button>
      </div>

      {!employeeId ? (
        <div className="mt-8 text-center text-sm text-gray-400">
          Ingresa el ID de un empleado para ver sus excepciones de horario.
        </div>
      ) : loading ? (
        <SkeletonTable cols={5} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((ex) => (
                  <tr key={ex.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3">{ex.date}</td>
                    <td className="px-4 py-3">
                      {ex.employee ? (
                        <Link to={`/employees/${ex.employee_id}`} className="font-medium text-radar hover:underline">
                          {ex.employee.first_name} {ex.employee.last_name}
                        </Link>
                      ) : `#${ex.employee_id}`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ex.is_working_day ? 'present' : 'rest'} />
                    </td>
                    <td className="px-4 py-3">{ex.reason ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 cursor-pointer"
                        onClick={() => handleDelete(ex.id)}
                      >
                        <HiOutlineTrash className="h-4 w-4" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                      No hay excepciones para este empleado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-grafito p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Nueva excepción de horario</h3>
              <button className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setShowModal(false)}>
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Employee search */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Empleado</label>
                {selectedEmployee ? (
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-grafito-light px-3 py-2">
                    <span className="text-sm text-white">{selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.internal_id})</span>
                    <button className="text-gray-400 hover:text-white cursor-pointer" onClick={() => { setSelectedEmployee(null); setEmployeeSearch(''); }}>
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o ID..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className={`w-full ${inputBase}`}
                    />
                    {employeeResults.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/10 bg-grafito-light shadow-lg">
                        {employeeResults.map((emp) => (
                          <li key={emp.id}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-grafito-lighter cursor-pointer"
                              onClick={() => { setSelectedEmployee(emp); setEmployeeSearch(''); setEmployeeResults([]); }}
                            >
                              {emp.first_name} {emp.last_name} — {emp.internal_id}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Fecha</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className={`w-full ${inputBase}`} />
              </div>

              {/* Is working day */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={formIsWorkingDay} onChange={(e) => setFormIsWorkingDay(e.target.checked)} className="rounded" />
                  Es día laborable
                </label>
                <span className="mt-1 block text-xs text-gray-400">
                  {formIsWorkingDay ? 'El empleado debe trabajar este día (ej: día extra)' : 'El empleado no trabaja este día (ej: permiso, feriado)'}
                </span>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Motivo</label>
                <textarea
                  rows={2}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className={`w-full ${inputBase}`}
                  placeholder="Ej: Permiso personal, feriado empresa..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer"
                  disabled={submitting}
                  onClick={handleCreate}
                >
                  {submitting ? 'Creando...' : 'Crear excepción'}
                </button>
                <button
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

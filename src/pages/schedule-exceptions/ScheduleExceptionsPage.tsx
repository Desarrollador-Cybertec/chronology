import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { scheduleExceptions } from '@/api/endpoints';
import type { ScheduleException, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { sileo } from 'sileo';
import { SkeletonTable } from '@/components/ui/Skeleton';
import ExceptionFormModal from '@/components/schedule-exceptions/ExceptionFormModal';
import {
  HiOutlineCalendarDays,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { INPUT_BASE } from '@/constants/ui';

export default function ScheduleExceptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ScheduleException[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, _setPage] = useState(Number(searchParams.get('page') ?? 1));

  const [employeeId, setEmployeeId] = useState(searchParams.get('employee_id') ?? '');
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineCalendarDays className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Excepciones de horario</h2>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <HiOutlinePlusCircle className="h-4 w-4" /> Nueva excepción
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <input
          type="number"
          placeholder="ID empleado"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`${INPUT_BASE} w-40`}
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

      <ExceptionFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchData}
      />
    </div>
  );
}

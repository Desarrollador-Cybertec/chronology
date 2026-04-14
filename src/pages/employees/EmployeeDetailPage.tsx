import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { employees, shiftAssignments, scheduleExceptions } from '@/api/endpoints';
import type { Employee, ShiftAssignment, ScheduleException, PaginationMeta } from '@/types/api';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import TutorialModal from '@/components/ui/TutorialModal';
import ExceptionFormModal from '@/components/schedule-exceptions/ExceptionFormModal';
import { employeeDetailSteps, employeeDetailAdminSteps } from '@/data/pageTutorials';
import { HiOutlineTrash, HiOutlinePencilSquare, HiOutlinePlusCircle } from 'react-icons/hi2';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSuperadmin } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Exceptions
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [excMeta, setExcMeta] = useState<PaginationMeta | null>(null);
  const [excPage, setExcPage] = useState(1);
  const [excLoading, setExcLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const empId = Number(id);
    Promise.all([
      employees.get(empId),
      shiftAssignments.listByEmployee(empId),
    ])
      .then(([empRes, assignRes]) => {
        setEmployee(empRes.data);
        setAssignments(assignRes.data);
      })
      .catch(() => sileo.error({ title: 'Error al cargar empleado' }))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchExceptions = useCallback(() => {
    if (!id) return;
    setExcLoading(true);
    scheduleExceptions.listByEmployee(Number(id), { page: excPage, per_page: 10 })
      .then((res) => { setExceptions(res.data); setExcMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar excepciones' }))
      .finally(() => setExcLoading(false));
  }, [id, excPage]);

  useEffect(() => { fetchExceptions(); }, [fetchExceptions]);

  const handleExceptionCreated = () => {
    if (excPage !== 1) setExcPage(1);
    else fetchExceptions();
  };

  const handleDeleteException = async (exId: number) => {
    if (!confirm('¿Eliminar esta excepción de horario?')) return;
    try {
      await scheduleExceptions.delete(exId);
      setExceptions((prev) => prev.filter((e) => e.id !== exId));
      sileo.success({ title: 'Excepción eliminada' });
    } catch {
      sileo.error({ title: 'Error al eliminar excepción' });
    }
  };

  const handleUnassign = async (assignmentId: number) => {
    const target = assignments.find((a) => a.id === assignmentId);
    if (!confirm(`¿Desasignar turno "${target?.shift?.name ?? ''}"?`)) return;
    try {
      await shiftAssignments.delete(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      sileo.success({ title: 'Turno desasignado' });
    } catch {
      sileo.error({ title: 'Error al desasignar turno' });
    }
  };

  if (loading) return <SkeletonDetail rows={8} />;
  if (!employee) return <p className="text-gray-400">Empleado no encontrado.</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/employees" className="text-sm text-radar hover:underline">← Empleados</Link>
          <h2 className="text-2xl font-bold text-white">{employee.first_name} {employee.last_name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TutorialModal steps={isSuperadmin ? employeeDetailAdminSteps : employeeDetailSteps} />
          {isSuperadmin && (
            <Link to={`/employees/${employee.id}/edit`} className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark">
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Información</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">ID Interno</dt><dd className="font-medium">{employee.internal_id}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Departamento</dt><dd className="font-medium">{employee.department ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Cargo</dt><dd className="font-medium">{employee.position ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Estado</dt><dd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${employee.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {employee.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </dd></div>
          </dl>
        </div>

        {employee.attendance_summary && (
          <div className="rounded-xl bg-grafito p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">Resumen de asistencia</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Días trabajados</dt><dd className="font-medium">{employee.attendance_summary.total_days_worked}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Días ausente</dt><dd className="font-medium">{employee.attendance_summary.total_days_absent}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Días incompletos</dt><dd className="font-medium">{employee.attendance_summary.total_days_incomplete}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Minutos trabajados</dt><dd className="font-medium">{employee.attendance_summary.total_worked_minutes.toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">HE totales</dt><dd className="font-medium">{employee.attendance_summary.total_overtime_minutes} min</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">HE diurnas</dt><dd className="font-medium">{employee.attendance_summary.total_overtime_diurnal_minutes} min</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">HE nocturnas</dt><dd className="font-medium">{employee.attendance_summary.total_overtime_nocturnal_minutes} min</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Minutos tarde</dt><dd className="font-medium text-amber-400">{employee.attendance_summary.total_late_minutes}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Salidas tempranas</dt><dd className="font-medium text-amber-400">{employee.attendance_summary.total_early_departure_minutes} min</dd></div>
            </dl>
          </div>
        )}

        <div className="lg:col-span-2 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Asignaciones de turno</h3>
            {isSuperadmin && (
              <Link to={`/employees/${employee.id}/assign-shift`} className="rounded-lg bg-radar px-3 py-1.5 text-xs font-semibold text-white hover:bg-radar-dark">+ Asignar</Link>
            )}
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400">Sin asignaciones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                  <tr><th className="pb-2">Turno</th><th className="pb-2">Desde</th><th className="pb-2">Hasta</th><th className="pb-2">Días</th>{isSuperadmin && <th className="pb-2"></th>}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2">{a.shift?.name ?? `#${a.shift_id}`}</td>
                      <td className="py-2">{a.effective_date}</td>
                      <td className="py-2">{a.end_date ?? 'Indefinido'}</td>
                      <td className="py-2">{a.work_days.map((d) => DAY_NAMES[d]).join(', ')}</td>
                      {isSuperadmin && (
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/employees/${employee.id}/shifts/${a.id}/edit`}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-radar/10 hover:text-radar"
                              title="Editar turno"
                            >
                              <HiOutlinePencilSquare className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                              title="Desasignar turno"
                              onClick={() => handleUnassign(a.id)}
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

          <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Excepciones de horario</h3>
            {isSuperadmin && (
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-radar px-3 py-1.5 text-xs font-semibold text-white hover:bg-radar-dark cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <HiOutlinePlusCircle className="h-4 w-4" /> Nueva excepción
              </button>
            )}
          </div>
          {excLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : exceptions.length === 0 ? (
            <p className="text-sm text-gray-400">Sin excepciones.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">Turno</th>
                      <th className="pb-2">Motivo</th>
                      {isSuperadmin && <th className="pb-2"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {exceptions.map((ex) => (
                      <tr key={ex.id}>
                        <td className="py-2">{ex.date}</td>
                        <td className="py-2"><StatusBadge status={ex.is_working_day ? 'present' : 'rest'} /></td>
                        <td className="py-2">{ex.shift?.name ?? '—'}</td>
                        <td className="py-2">{ex.reason ?? '—'}</td>
                        {isSuperadmin && (
                          <td className="py-2">
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                              title="Eliminar excepción"
                              onClick={() => handleDeleteException(ex.id)}
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {excMeta && <Pagination meta={excMeta} onPageChange={(p) => setExcPage(p)} />}
            </>
          )}
        </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-white">Asistencia reciente</h3>
        <Link to={`/attendance?employee_internal_id=${employee.internal_id}`} className="text-sm font-medium text-radar hover:underline">
          Ver asistencia completa →
        </Link>
      </div>

      <ExceptionFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleExceptionCreated}
        employeeId={Number(id)}
      />
    </div>
  );
}

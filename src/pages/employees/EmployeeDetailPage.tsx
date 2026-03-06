import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { employees, shiftAssignments, scheduleExceptions } from '@/api/endpoints';
import type { Employee, ShiftAssignment, ScheduleException } from '@/types/api';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { employeeDetailSteps, employeeDetailAdminSteps } from '@/data/pageTutorials';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSuperadmin } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const empId = Number(id);
    Promise.all([
      employees.get(empId),
      shiftAssignments.listByEmployee(empId),
      scheduleExceptions.listByEmployee(empId),
    ])
      .then(([empRes, assignRes, excRes]) => {
        setEmployee(empRes.data);
        setAssignments(assignRes.data);
        setExceptions(excRes.data);
      })
      .catch(() => sileo.error({ title: 'Error al cargar empleado' }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail rows={8} />;
  if (!employee) return <p className="text-gray-500">Empleado no encontrado.</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/employees" className="text-sm text-indigo-600 hover:underline">← Empleados</Link>
          <h2 className="text-2xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TutorialModal steps={isSuperadmin ? employeeDetailAdminSteps : employeeDetailSteps} />
          {isSuperadmin && (
            <Link to={`/employees/${employee.id}/edit`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">ID Interno</dt><dd className="font-medium">{employee.internal_id}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Departamento</dt><dd className="font-medium">{employee.department ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Cargo</dt><dd className="font-medium">{employee.position ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Estado</dt><dd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${employee.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {employee.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </dd></div>
          </dl>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Asignaciones de turno</h3>
            {isSuperadmin && (
              <Link to={`/employees/${employee.id}/assign-shift`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">+ Asignar</Link>
            )}
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400">Sin asignaciones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <tr><th className="pb-2">Turno</th><th className="pb-2">Desde</th><th className="pb-2">Hasta</th><th className="pb-2">Días</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2">{a.shift?.name ?? `#${a.shift_id}`}</td>
                      <td className="py-2">{a.effective_date}</td>
                      <td className="py-2">{a.end_date ?? 'Indefinido'}</td>
                      <td className="py-2">{a.work_days.map((d) => DAY_NAMES[d]).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Excepciones de horario</h3>
          {exceptions.length === 0 ? (
            <p className="text-sm text-gray-400">Sin excepciones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <tr><th className="pb-2">Fecha</th><th className="pb-2">Tipo</th><th className="pb-2">Turno</th><th className="pb-2">Motivo</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exceptions.map((ex) => (
                    <tr key={ex.id}>
                      <td className="py-2">{ex.date}</td>
                      <td className="py-2"><StatusBadge status={ex.is_working_day ? 'present' : 'rest'} /></td>
                      <td className="py-2">{ex.shift?.name ?? '—'}</td>
                      <td className="py-2">{ex.reason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Asistencia reciente</h3>
        <Link to={`/attendance?employee_id=${employee.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
          Ver asistencia completa →
        </Link>
      </div>
    </div>
  );
}

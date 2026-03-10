import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { attendance } from '@/api/endpoints';
import type { AttendanceRecord } from '@/types/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { attendanceDetailSteps } from '@/data/pageTutorials';

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSuperadmin } = useAuth();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    attendance.get(Number(id))
      .then((res) => setRecord(res.data))
      .catch(() => sileo.error({ title: 'Error al cargar registro' }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail rows={10} />;
  if (!record) return <p className="text-gray-400">Registro no encontrado.</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/attendance" className="text-sm text-radar hover:underline">← Asistencia</Link>
          <h2 className="text-2xl font-bold text-white">Detalle de asistencia — {record.date_reference}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TutorialModal steps={attendanceDetailSteps} />
          {isSuperadmin && (
            <Link to={`/attendance/${record.id}/edit`} className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark">
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Empleado</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Nombre</dt><dd>
              <Link to={`/employees/${record.employee_id}`} className="font-medium text-radar hover:underline">
                {record.employee.first_name} {record.employee.last_name}
              </Link>
            </dd></div>

          </dl>
        </div>

        <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Marcajes</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Entrada</dt><dd className="font-medium">{record.first_check_in ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Salida</dt><dd className="font-medium">{record.last_check_out ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Minutos trabajados</dt><dd className="font-medium">{formatMinutes(record.worked_minutes)}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Cálculos</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Tardanza</dt><dd className={record.late_minutes > 0 ? 'font-medium text-red-600' : 'font-medium'}>{record.late_minutes > 0 ? formatMinutes(record.late_minutes) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Salida temprana</dt><dd className="font-medium">{record.early_departure_minutes > 0 ? formatMinutes(record.early_departure_minutes) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">HE Total</dt><dd className="font-medium">{record.overtime_minutes > 0 ? formatMinutes(record.overtime_minutes) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">HE Diurnas</dt><dd className="font-medium">{record.overtime_diurnal_minutes > 0 ? formatMinutes(record.overtime_diurnal_minutes) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">HE Nocturnas</dt><dd className="font-medium">{record.overtime_nocturnal_minutes > 0 ? formatMinutes(record.overtime_nocturnal_minutes) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Estado</dt><dd><StatusBadge status={record.status} /></dd></div>
          </dl>
        </div>
      </div>

      {record.is_manually_edited && record.edits && record.edits.length > 0 && (
        <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Historial de ediciones</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <th className="pb-2">Campo</th>
                  <th className="pb-2">Valor anterior</th>
                  <th className="pb-2">Valor nuevo</th>
                  <th className="pb-2">Motivo</th>
                  <th className="pb-2">Editor</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {record.edits.map((edit) => (
                  <tr key={edit.id}>
                    <td className="py-2">{edit.field_changed}</td>
                    <td className="py-2"><code className="rounded bg-white/5 px-1 text-xs">{edit.old_value}</code></td>
                    <td className="py-2"><code className="rounded bg-white/5 px-1 text-xs">{edit.new_value}</code></td>
                    <td className="py-2">{edit.reason}</td>
                    <td className="py-2">{edit.editor.name}</td>
                    <td className="py-2">{new Date(edit.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

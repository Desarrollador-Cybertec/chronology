import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { attendance, employees, imports } from '@/api/endpoints';
import StatusBadge from '@/components/ui/StatusBadge';
import type { AttendanceRecord, ImportBatch } from '@/types/api';
import { sileo } from 'sileo';

export default function DashboardPage() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [recentImport, setRecentImport] = useState<ImportBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attendance.byDay(today, { per_page: 5 }).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 5, from: null, to: null } })),
      employees.list(1).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20, from: null, to: null } })),
      imports.list(1).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20, from: null, to: null } })),
    ]).then(([attRes, empRes, impRes]) => {
      setTodayRecords(attRes.data);
      setTotalEmployees(empRes.meta.total);
      setRecentImport(impRes.data[0] ?? null);
    }).catch(() => sileo.error({ title: 'Error al cargar dashboard' }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const lateCount = todayRecords.filter((r) => r.late_minutes > 0).length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">¡Hola, {user?.name}!</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <span className="block text-3xl font-bold text-gray-900">{totalEmployees}</span>
          <span className="text-sm text-gray-500">Empleados registrados</span>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <span className="block text-3xl font-bold text-gray-900">{presentCount}</span>
          <span className="text-sm text-gray-500">Presentes hoy</span>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <span className="block text-3xl font-bold text-red-600">{lateCount}</span>
          <span className="text-sm text-gray-500">Tardanzas hoy</span>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <span className="block text-3xl font-bold text-gray-900">{recentImport ? <StatusBadge status={recentImport.status} /> : '—'}</span>
          <span className="text-sm text-gray-500">Última importación</span>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Asistencia de hoy — {today}</h3>
          <Link to={`/attendance?date_from=${today}&date_to=${today}`} className="text-sm font-medium text-indigo-600 hover:underline">
            Ver todo →
          </Link>
        </div>

        {todayRecords.length === 0 ? (
          <p className="text-sm text-gray-400">No hay registros para hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-2">Empleado</th>
                  <th className="pb-2">Entrada</th>
                  <th className="pb-2">Tardanza</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todayRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td className="py-2">{rec.employee.first_name} {rec.employee.last_name}</td>
                    <td className="py-2">{rec.first_check_in?.split(' ')[1] ?? '—'}</td>
                    <td className={`py-2 ${rec.late_minutes > 0 ? 'text-red-600 font-medium' : ''}`}>
                      {rec.late_minutes > 0 ? `${rec.late_minutes} min` : '—'}
                    </td>
                    <td className="py-2"><StatusBadge status={rec.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

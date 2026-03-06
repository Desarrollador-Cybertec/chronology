import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { attendance, employees, imports } from '@/api/endpoints';
import StatusBadge from '@/components/ui/StatusBadge';
import TutorialModal from '@/components/ui/TutorialModal';
import FileDropZone from '@/components/ui/FileDropZone';
import { managerSteps, adminSteps } from '@/data/tutorialSteps';
import type { AttendanceRecord, ImportBatch } from '@/types/api';
import { ApiError } from '@/api/client';
import { sileo } from 'sileo';
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { SkeletonCard, SkeletonTable, Skeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { user, isSuperadmin } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [recentImport, setRecentImport] = useState<ImportBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await imports.upload(file);
      sileo.success({ title: 'Archivo subido', description: `${res.data.total_rows} filas detectadas. Procesando...` });
      setRecentImport(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: string[] };
        sileo.error({ title: 'Error de validación', description: body.errors?.[0] });
      } else {
        sileo.error({ title: 'Error al subir archivo' });
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div>
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <Skeleton className="mt-6 h-20 w-full rounded-xl" />
      <SkeletonTable cols={4} rows={5} />
    </div>
  );

  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const lateCount = todayRecords.filter((r) => r.late_minutes > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">¡Hola, {user?.name}!</h2>
        <TutorialModal
          steps={isSuperadmin ? adminSteps : managerSteps}
          buttonLabel={isSuperadmin ? 'Tutorial Admin' : 'Tutorial'}
        />
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <HiOutlineUsers className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-gray-900">{totalEmployees}</span>
            <span className="text-sm text-gray-500">Empleados</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <HiOutlineCheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-gray-900">{presentCount}</span>
            <span className="text-sm text-gray-500">Presentes hoy</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <HiOutlineExclamationTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-red-600">{lateCount}</span>
            <span className="text-sm text-gray-500">Tardanzas hoy</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <HiOutlineArrowUpTray className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-gray-900">{recentImport ? <StatusBadge status={recentImport.status} /> : '—'}</span>
            <span className="text-sm text-gray-500">Última importación</span>
          </div>
        </div>
      </div>

      {/* Quick CSV Upload */}
      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineArrowUpTray className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Importar CSV rápido</h3>
          </div>
          <Link to="/import" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            Historial <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
          </Link>
        </div>
        <FileDropZone onFileSelected={handleUpload} disabled={uploading} compact />
        {uploading && <p className="mt-2 text-xs text-indigo-600 animate-pulse">Subiendo archivo...</p>}
      </div>

      {/* Today's Attendance */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineClipboardDocumentCheck className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Asistencia de hoy — {today}</h3>
          </div>
          <Link to={`/attendance?date_from=${today}&date_to=${today}`} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
            Ver todo <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
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

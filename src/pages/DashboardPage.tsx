import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { attendance, employees, imports } from '@/api/endpoints';
import StatusBadge from '@/components/ui/StatusBadge';
import TutorialModal from '@/components/ui/TutorialModal';
import FileDropZone from '@/components/ui/FileDropZone';
import ProcessingIndicator from '@/components/ui/ProcessingIndicator';
import { managerSteps, adminSteps } from '@/data/tutorialSteps';
import type { AttendanceRecord, ImportBatch } from '@/types/api';
import { ApiError } from '@/api/client';
import { sileo } from 'sileo';
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { SkeletonCard, SkeletonTable, Skeleton } from '@/components/ui/Skeleton';
import { useTableSort } from '@/hooks/useTableSort';
import SortableHeader from '@/components/ui/SortableHeader';

interface LateOffender {
  employeeId: number;
  name: string;
  count: number;
  totalMinutes: number;
  avgMinutes: number;
  lastDate: string;
}

export default function DashboardPage() {
  const { user, isSuperadmin } = useAuth();
  const [lateOffenders, setLateOffenders] = useState<LateOffender[]>([]);
  const [totalLateRecords, setTotalLateRecords] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [recentImport, setRecentImport] = useState<ImportBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingBatch, setProcessingBatch] = useState<ImportBatch | null>(null);

  const lateAccessors = useMemo(() => ({
    name: (o: LateOffender) => o.name,
    count: (o: LateOffender) => o.count,
    totalMinutes: (o: LateOffender) => o.totalMinutes,
    avgMinutes: (o: LateOffender) => o.avgMinutes,
    lastDate: (o: LateOffender) => o.lastDate,
  }), []);
  const { sortKey, sortDir, toggle, sorted: sortedOffenders } = useTableSort(lateOffenders, lateAccessors);

  useEffect(() => {
    Promise.all([
      attendance.list({ has_late: 1, per_page: 100 }).catch(() => ({ data: [] as AttendanceRecord[], meta: { total: 0, current_page: 1, last_page: 1, per_page: 100, from: null, to: null } })),
      employees.list(1).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20, from: null, to: null } })),
      imports.list(1).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20, from: null, to: null } })),
    ]).then(([attRes, empRes, impRes]) => {
      setTotalLateRecords(attRes.meta.total);

      const grouped = new Map<number, { name: string; count: number; totalMinutes: number; lastDate: string }>();
      for (const rec of attRes.data) {
        const existing = grouped.get(rec.employee_id);
        if (existing) {
          existing.count++;
          existing.totalMinutes += rec.late_minutes;
          if (rec.date_reference > existing.lastDate) existing.lastDate = rec.date_reference;
        } else {
          grouped.set(rec.employee_id, {
            name: `${rec.employee.first_name} ${rec.employee.last_name}`,
            count: 1,
            totalMinutes: rec.late_minutes,
            lastDate: rec.date_reference,
          });
        }
      }

      const offenders: LateOffender[] = Array.from(grouped.entries())
        .filter(([, v]) => v.count >= 2)
        .map(([id, v]) => ({
          employeeId: id,
          name: v.name,
          count: v.count,
          totalMinutes: v.totalMinutes,
          avgMinutes: Math.round(v.totalMinutes / v.count),
          lastDate: v.lastDate,
        }))
        .sort((a, b) => b.count - a.count);

      setLateOffenders(offenders);
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
      setProcessingBatch(res.data);
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
      <SkeletonTable cols={6} rows={5} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">¡Hola, {user?.name}!</h2>
        <TutorialModal
          steps={isSuperadmin ? adminSteps : managerSteps}
          buttonLabel={isSuperadmin ? 'Tutorial Admin' : 'Tutorial'}
        />
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-radar/10 text-radar">
            <HiOutlineUsers className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">{totalEmployees}</span>
            <span className="text-sm text-gray-400">Empleados</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <HiOutlineExclamationTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-red-600">{lateOffenders.length}</span>
            <span className="text-sm text-gray-400">Reincidentes</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <HiOutlineClock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">{totalLateRecords}</span>
            <span className="text-sm text-gray-400">Total tardanzas</span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <HiOutlineArrowUpTray className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">{recentImport ? <StatusBadge status={recentImport.status} /> : '—'}</span>
            <span className="text-sm text-gray-400">Última importación</span>
          </div>
        </div>
      </div>

      {/* Quick CSV Upload */}
      <div className="mt-6 rounded-xl bg-grafito p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineArrowUpTray className="h-5 w-5 text-radar" />
            <h3 className="text-sm font-semibold text-white">Importar CSV rápido</h3>
          </div>
          <Link to="/import" className="flex items-center gap-1 text-sm text-radar hover:underline">
            Historial <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
          </Link>
        </div>
        <FileDropZone onFileSelected={handleUpload} disabled={uploading} compact />
        {uploading && <p className="mt-2 text-xs text-radar animate-pulse">Subiendo archivo...</p>}
        {processingBatch && (
          <div className="mt-3">
            <ProcessingIndicator
              batch={processingBatch}
              onComplete={() => setProcessingBatch(null)}
            />
          </div>
        )}
      </div>

      {/* Repeat Late Offenders */}
      <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineArrowPath className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Reincidentes de tardanza</h3>
          </div>
          <Link to="/attendance?has_late=1" className="flex items-center gap-1 text-sm font-medium text-radar hover:underline">
            Ver todo <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
          </Link>
        </div>

        {lateOffenders.length === 0 ? (
          <p className="text-sm text-gray-400">No hay empleados con tardanzas recurrentes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="Empleado" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-0" />
                  <SortableHeader label="Veces tarde" column="count" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-0 text-center" />
                  <SortableHeader label="Total min" column="totalMinutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-0 text-right" />
                  <SortableHeader label="Promedio" column="avgMinutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-0 text-right" />
                  <SortableHeader label="Última tardanza" column="lastDate" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-0" />
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedOffenders.map((o) => (
                  <tr key={o.employeeId}>
                    <td className="py-2 font-medium text-white">{o.name}</td>
                    <td className="py-2 text-center">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{o.count}</span>
                    </td>
                    <td className="py-2 text-right text-red-600 font-medium">{o.totalMinutes} min</td>
                    <td className="py-2 text-right text-gray-400">{o.avgMinutes} min</td>
                    <td className="py-2 text-gray-400">{o.lastDate}</td>
                    <td className="py-2">
                      <Link to={`/employees/${o.employeeId}`} className="text-radar hover:underline text-xs">Ver perfil</Link>
                    </td>
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

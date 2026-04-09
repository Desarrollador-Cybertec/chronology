import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { attendance, employees, imports } from '@/api/endpoints';
import StatusBadge from '@/components/ui/StatusBadge';
import TutorialModal from '@/components/ui/TutorialModal';
import FileDropZone from '@/components/ui/FileDropZone';
import ProcessingIndicator from '@/components/ui/ProcessingIndicator';
import { managerSteps, adminSteps } from '@/data/tutorialSteps';
import type { AttendanceRecord, ImportBatch } from '@/types/api';
import { ApiError, isSubscriptionError } from '@/api/client';
import { sileo } from 'sileo';
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { SkeletonCard, SkeletonTable, Skeleton } from '@/components/ui/Skeleton';
import { useTableSort } from '@/hooks/useTableSort';
import SortableHeader from '@/components/ui/SortableHeader';

// ── Week utilities ────────────────────────────────────────────────────────────────────────────
interface Week { from: Date; to: Date }

const MONTHS_FULL_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getWeekPeriods(periodStart: Date, periodEnd: Date): Week[] {
  const weeks: Week[] = [];
  let cursor = new Date(periodStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(periodEnd);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const weekFrom = new Date(cursor);
    let weekTo = new Date(cursor);
    while (weekTo.getDay() !== 0 && weekTo < end) {
      weekTo.setDate(weekTo.getDate() + 1);
    }
    if (weekTo > end) weekTo = new Date(end);
    weeks.push({ from: weekFrom, to: new Date(weekTo) });
    cursor = new Date(weekTo);
    cursor.setDate(cursor.getDate() + 1);
  }
  return weeks;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getAvailableMonths(start: Date, end: Date): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= endMonth) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value, label: `${MONTHS_FULL_ES[cursor.getMonth()]} ${cursor.getFullYear()}` });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function getMonthWeeks(monthKey: string, dataStart: Date, dataEnd: Date): Week[] {
  const [year, month] = monthKey.split('-').map(Number);
  const from = new Date(Math.max(new Date(year, month - 1, 1).getTime(), dataStart.getTime()));
  const to = new Date(Math.min(new Date(year, month, 0).getTime(), dataEnd.getTime()));
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  return from <= to ? getWeekPeriods(from, to) : [];
}

// ── Types ──────────────────────────────────────────────────────────────────────────────────
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
  const [dataRange, setDataRange] = useState<{ start: Date; end: Date } | null>(null);
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekLoading, setWeekLoading] = useState(false);
  const firstAttendanceLoad = useRef(false);
  const [lateOffenders, setLateOffenders] = useState<LateOffender[]>([]);
  const [singleLates, setSingleLates] = useState<LateOffender[]>([]);
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
      attendance.dateRange(),
      employees.list(1).catch(() => ({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20, from: null, to: null } })),
      imports.list(1).catch(() => ({ data: [] as ImportBatch[], meta: { total: 0, current_page: 1, last_page: 1, per_page: 100, from: null, to: null } })),
    ]).then(([rangeRes, empRes, impRes]) => {
      setRecentImport(impRes.data.length > 0 ? impRes.data[impRes.data.length - 1] : null);
      setTotalEmployees(empRes.meta.total);

      const { min_date, max_date } = rangeRes.data;
      if (!min_date || !max_date) {
        // No processed data yet — skip week setup, show empty state
        setLoading(false);
        return;
      }

      const start = new Date(`${min_date}T00:00:00`);
      const end = new Date(`${max_date}T00:00:00`);
      setDataRange({ start, end });
      const months = getAvailableMonths(start, end);
      setAvailableMonths(months);
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const defaultMonth = months.find(m => m.value === todayKey)?.value ?? months[months.length - 1].value;
      setSelectedMonth(defaultMonth);
    }).catch(() => {
      sileo.error({ title: 'Error al cargar dashboard' });
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute weeks when selected month or data range changes
  useEffect(() => {
    if (!selectedMonth || !dataRange) return;
    const computed = getMonthWeeks(selectedMonth, dataRange.start, dataRange.end);
    setWeeks(computed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let idx = computed.findIndex(w => today >= w.from && today <= w.to);
    if (idx === -1) idx = computed.findIndex(w => dataRange.end >= w.from && dataRange.end <= w.to);
    if (idx === -1) idx = computed.length - 1;
    setWeekIndex(Math.max(0, idx));
  }, [selectedMonth, dataRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attendance: re-fetch for the selected week
  useEffect(() => {
    if (weeks.length === 0) return;
    const week = weeks[weekIndex];
    setWeekLoading(true);
    attendance.list({
      date_from: toYMD(week.from),
      date_to: toYMD(week.to),
      has_late: 1,
      per_page: 100,
    }).then((res) => {
      setTotalLateRecords(res.meta.total);

      const grouped = new Map<number, { name: string; count: number; totalMinutes: number; lastDate: string }>();
      for (const rec of res.data) {
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

      const all: LateOffender[] = Array.from(grouped.entries()).map(([id, v]) => ({
        employeeId: id,
        name: v.name,
        count: v.count,
        totalMinutes: v.totalMinutes,
        avgMinutes: Math.round(v.totalMinutes / v.count),
        lastDate: v.lastDate,
      }));

      setLateOffenders(all.filter(o => o.count >= 2).sort((a, b) => b.count - a.count));
      setSingleLates(all.filter(o => o.count === 1).sort((a, b) => b.totalMinutes - a.totalMinutes));
    }).catch(() => {
      sileo.error({ title: 'Error al cargar estadísticas de la semana' });
    }).finally(() => {
      setWeekLoading(false);
      if (!firstAttendanceLoad.current) {
        firstAttendanceLoad.current = true;
        setLoading(false);
      }
    });
  }, [weeks, weekIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await imports.upload(file);
      sileo.success({ title: 'Archivo subido', description: `${res.data.total_rows} filas detectadas. Procesando...` });
      setRecentImport(res.data);
      setProcessingBatch(res.data);
    } catch (err) {
      if (isSubscriptionError(err)) return;
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
      <Skeleton className="mt-4 h-16 w-full rounded-xl" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <Skeleton className="mt-6 h-20 w-full rounded-xl" />
      <SkeletonTable cols={6} rows={5} />
    </div>
  );

  const currentWeek = weeks[weekIndex] ?? null;
  const noData = availableMonths.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">¡Hola, {user?.name}!</h2>
        <TutorialModal
          steps={isSuperadmin ? adminSteps : managerSteps}
          buttonLabel={isSuperadmin ? 'Tutorial Admin' : 'Tutorial'}
        />
      </div>

      {/* Week Navigator */}
      {!noData && currentWeek && (
        <div className="mt-4 rounded-xl bg-grafito shadow-sm overflow-hidden">
          {/* Top bar: month selector + week pills */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/8 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mes</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-white/10 bg-navy/60 px-3 py-1.5 text-sm font-semibold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-radar transition"
              >
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Semana</span>
              <button
                type="button"
                onClick={() => setWeekIndex(i => Math.max(0, i - 1))}
                disabled={weekIndex === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <HiOutlineChevronLeft className="h-4 w-4" />
              </button>
              {weeks.map((w, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWeekIndex(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    i === weekIndex
                      ? 'bg-radar text-white shadow-sm'
                      : 'border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  <span className="hidden sm:inline">Semana </span>{i + 1}
                  <span className="ml-1 hidden md:inline text-[10px] font-normal opacity-70">({fmtDay(w.from)}–{fmtDay(w.to)})</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWeekIndex(i => Math.min(weeks.length - 1, i + 1))}
                disabled={weekIndex === weeks.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <HiOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Active week info bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.03]">
            <p className="text-sm text-gray-300">
              Mostrando datos del{' '}
              <span className="font-semibold text-white">
                {fmtDay(currentWeek.from)} al {fmtDay(currentWeek.to)}
              </span>
            </p>
            {weekLoading && (
              <span className="flex items-center gap-1.5 text-xs text-radar animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-radar inline-block" />
                Actualizando...
              </span>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {noData ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-grafito p-8 text-center shadow-sm">
          <HiOutlineArrowUpTray className="mx-auto h-10 w-10 text-gray-500" />
          <p className="mt-3 text-sm font-medium text-gray-300">No hay datos procesados aún</p>
          <p className="mt-1 text-xs text-gray-500">Sube un CSV desde la sección de importación para ver las estadísticas semanales.</p>
          <Link to="/import" className="mt-4 inline-block rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark transition">
            Ir a importar
          </Link>
        </div>
      ) : (
        <>
      {/* KPI Cards */}
      <div className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-200 ${weekLoading ? 'opacity-50' : ''}`}>
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
              onComplete={() => {
                setProcessingBatch(null);
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>

      {/* Tardanzas de la semana */}
      <div className={`mt-6 rounded-xl bg-grafito p-6 shadow-sm transition-opacity duration-200 ${weekLoading ? 'opacity-50' : ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineArrowPath className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">
              Reincidentes de tardanza
              {currentWeek && <span className="ml-2 text-sm font-normal text-gray-400">{fmtDay(currentWeek.from)} – {fmtDay(currentWeek.to)}</span>}
            </h3>
          </div>
          <Link to="/attendance?has_late=1" className="flex items-center gap-1 text-sm font-medium text-radar hover:underline">
            Ver todo <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
          </Link>
        </div>

        {lateOffenders.length === 0 && singleLates.length === 0 ? (
          <p className="text-sm text-gray-400">No hay empleados con tardanzas registradas.</p>
        ) : lateOffenders.length === 0 ? (
          <>
            <p className="mb-3 text-sm text-gray-400">No hay reincidentes — tardanzas únicas:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="pb-2 px-3">Empleado</th>
                    <th className="pb-2 px-3 text-right">Minutos tarde</th>
                    <th className="pb-2 px-3">Fecha</th>
                    <th className="pb-2 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {singleLates.map((o) => (
                    <tr key={o.employeeId}>
                      <td className="py-2 px-3 font-medium text-white">{o.name}</td>
                      <td className="py-2 px-3 text-right text-amber-400 font-medium">{o.totalMinutes} min</td>
                      <td className="py-2 px-3 text-gray-400">{o.lastDate}</td>
                      <td className="py-2 px-3">
                        <Link to={`/employees/${o.employeeId}`} className="text-radar hover:underline text-xs">Ver perfil</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="Empleado" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-3" />
                  <SortableHeader label="Veces tarde" column="count" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-3 text-center" />
                  <SortableHeader label="Total min" column="totalMinutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-3 text-right" />
                  <SortableHeader label="Promedio" column="avgMinutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-3 text-right" />
                  <SortableHeader label="Última tardanza" column="lastDate" sortKey={sortKey} sortDir={sortDir} onSort={toggle} className="pb-2 px-3" />
                  <th className="pb-2 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedOffenders.map((o) => (
                  <tr key={o.employeeId}>
                    <td className="py-2 px-3 font-medium text-white">{o.name}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{o.count}</span>
                    </td>
                    <td className="py-2 px-3 text-right text-red-600 font-medium">{o.totalMinutes} min</td>
                    <td className="py-2 px-3 text-right text-gray-400">{o.avgMinutes} min</td>
                    <td className="py-2 px-3 text-gray-400">{o.lastDate}</td>
                    <td className="py-2 px-3">
                      <Link to={`/employees/${o.employeeId}`} className="text-radar hover:underline text-xs">Ver perfil</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

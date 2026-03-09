import { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sileo } from 'sileo';
import { employees as employeesApi, shifts as shiftsApi, shiftAssignments } from '@/api/endpoints';
import type { Employee, Shift, PaginationMeta } from '@/types/api';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTable } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftAssignmentPageSteps, shiftAssignmentPageAdminSteps } from '@/data/pageTutorials';
import SortableHeader from '@/components/ui/SortableHeader';
import {
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const assignSchema = z.object({
  shift_id: z.coerce.number().min(1, 'Selecciona un turno'),
  effective_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional().or(z.literal('')),
  work_days: z.array(z.number().min(0).max(6)).min(1, 'Selecciona al menos un día'),
});

type AssignFormData = z.infer<typeof assignSchema>;

const inputBase = 'w-full rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

const DAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export default function ShiftAssignmentPage() {
  const { isSuperadmin } = useAuth();
  const [empList, setEmpList] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [sortKey, setSortKey] = useState<string>('last_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggle = useCallback((column: string) => {
    const backendColumn = column === 'shift' ? 'current_shift' : column === 'name' ? 'last_name' : column;
    setSortDir(prev => sortKey === backendColumn ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(backendColumn);
    setLoading(true);
    _setPage(1);
  }, [sortKey]);

  // Map backend sort keys back to frontend column names for SortableHeader
  const displaySortKey = sortKey === 'current_shift' ? 'shift' : sortKey === 'last_name' ? 'name' : sortKey;

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema) as Resolver<AssignFormData>,
    defaultValues: { work_days: [1, 2, 3, 4, 5] },
  });

  const workDays = useWatch({ control, name: 'work_days' });

  useEffect(() => {
    shiftsApi.list(1).then((res) => setShifts(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setSearchDebounced(search);
      _setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    employeesApi.list(page, searchDebounced || undefined, sortKey, sortDir)
      .then((res) => { setEmpList(res.data); setMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar empleados' }))
      .finally(() => setLoading(false));
  }, [page, searchDebounced, sortKey, sortDir]);

  const toggleDay = (day: number) => {
    const current = workDays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setValue('work_days', next, { shouldValidate: true });
  };

  const toggleEmployee = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const activeIds = empList.filter((e) => e.is_active).map((e) => e.id);
    const allSelected = activeIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        activeIds.forEach((id) => next.delete(id));
      } else {
        activeIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const onSubmit = async (data: AssignFormData) => {
    if (selected.size === 0) {
      sileo.error({ title: 'Selecciona al menos un empleado' });
      return;
    }

    setAssigning(true);
    let ok = 0;
    let fail = 0;

    for (const empId of selected) {
      try {
        await shiftAssignments.create({
          employee_id: empId,
          shift_id: data.shift_id,
          effective_date: data.effective_date,
          end_date: data.end_date || undefined,
          work_days: data.work_days,
        });
        ok++;
      } catch {
        fail++;
      }
    }

    setAssigning(false);

    if (ok > 0) sileo.success({ title: `Turno asignado a ${ok} empleado${ok > 1 ? 's' : ''}` });
    if (fail > 0) sileo.error({ title: `${fail} asignación${fail > 1 ? 'es' : ''} fallida${fail > 1 ? 's' : ''}` });

    if (ok > 0) {
      setSelected(new Set());
      // Refresh employee list to show updated shift assignments
      setLoading(true);
      employeesApi.list(page, searchDebounced || undefined, sortKey, sortDir)
        .then((res) => { setEmpList(res.data); setMeta(res.meta); })
        .finally(() => setLoading(false));
    }
  };

  const getCurrentShift = (emp: Employee) => {
    const today = new Date().toISOString().slice(0, 10);
    const active = emp.shift_assignments?.find(
      (a) => a.effective_date <= today && (!a.end_date || a.end_date >= today),
    );
    return active;
  };

  const activeOnPage = empList.filter((e) => e.is_active).map((e) => e.id);
  const allPageSelected = activeOnPage.length > 0 && activeOnPage.every((id) => selected.has(id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineUserGroup className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Asignación de turnos</h2>
        </div>
        <TutorialModal steps={isSuperadmin ? shiftAssignmentPageAdminSteps : shiftAssignmentPageSteps} />
      </div>

      {/* Assignment form — superadmin only */}
      {isSuperadmin && (
        <div className="mt-6 rounded-xl bg-grafito p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-white">Asignar turno a empleados seleccionados</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <label htmlFor="shift_id" className="mb-1 block text-xs font-medium text-gray-300">Turno</label>
              <select id="shift_id" {...register('shift_id')} className={`${inputBase} ${errors.shift_id ? 'border-red-400' : ''}`}>
                <option value="">Seleccionar turno...</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.start_time} – {s.end_time})</option>
                ))}
              </select>
              {errors.shift_id && <span className="mt-1 block text-xs text-red-400">{errors.shift_id.message}</span>}
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="effective_date" className="mb-1 block text-xs font-medium text-gray-300">Fecha inicio</label>
              <input id="effective_date" type="date" {...register('effective_date')} className={`${inputBase} ${errors.effective_date ? 'border-red-400' : ''}`} />
              {errors.effective_date && <span className="mt-1 block text-xs text-red-400">{errors.effective_date.message}</span>}
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="end_date" className="mb-1 block text-xs font-medium text-gray-300">Fecha fin (opc.)</label>
              <input id="end_date" type="date" {...register('end_date')} className={inputBase} />
            </div>

            <div>
              <label id="work-days-label" className="mb-1 block text-xs font-medium text-gray-300">Días</label>
              <div className="flex gap-1" role="group" aria-labelledby="work-days-label">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition cursor-pointer ${
                      workDays?.includes(d.value)
                        ? 'border-radar bg-radar/10 text-radar'
                        : 'border-white/10 text-gray-400 hover:bg-grafito-lighter'
                    }`}
                    onClick={() => toggleDay(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {errors.work_days && <span className="mt-1 block text-xs text-red-400">{errors.work_days.message}</span>}
            </div>

            <button
              type="submit"
              className="rounded-lg bg-radar px-5 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer"
              disabled={assigning || selected.size === 0}
            >
              {assigning ? 'Asignando...' : `Asignar a ${selected.size} empleado${selected.size !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      )}

      {/* Employee table with selection */}
      <div className="mt-4">
        <div className="relative max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-grafito-light py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-radar"
          />
        </div>
      </div>
      {loading ? (
        <SkeletonTable cols={6} rows={8} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  {isSuperadmin && (
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-white/10 bg-grafito-light accent-radar cursor-pointer"
                      />
                    </th>
                  )}
                  <SortableHeader label="ID" column="internal_id" sortKey={displaySortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Empleado" column="name" sortKey={displaySortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Departamento" column="department" sortKey={displaySortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Turno actual" column="shift" sortKey={displaySortKey} sortDir={sortDir} onSort={toggle} />
                  <th className="px-4 py-3">Vigencia</th>
                  <SortableHeader label="Estado" column="is_active" sortKey={displaySortKey} sortDir={sortDir} onSort={toggle} />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {empList.map((emp) => {
                  const assignment = getCurrentShift(emp);
                  const isSelected = selected.has(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors ${isSelected ? 'bg-radar/5' : 'hover:bg-grafito-lighter'} ${!emp.is_active ? 'opacity-50' : ''}`}
                    >
                      {isSuperadmin && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmployee(emp.id)}
                            disabled={!emp.is_active}
                            className="h-4 w-4 rounded border-white/10 bg-grafito-light accent-radar cursor-pointer disabled:opacity-30"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-400">{emp.internal_id}</td>
                      <td className="px-4 py-3 font-medium text-white">{emp.first_name} {emp.last_name}</td>
                      <td className="px-4 py-3 text-gray-300">{emp.department ?? '—'}</td>
                      <td className="px-4 py-3">
                        {assignment?.shift ? (
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <HiOutlineClock className="h-4 w-4 text-radar" />
                            <span className="text-white">{assignment.shift.name}</span>
                            <span className="text-gray-400">({assignment.shift.start_time} – {assignment.shift.end_time})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-amber-400">
                            <HiOutlineXCircle className="h-4 w-4" /> Sin turno
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {assignment ? (
                          <>
                            {assignment.effective_date}
                            {assignment.end_date ? ` → ${assignment.end_date}` : ' → ∞'}
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {emp.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <HiOutlineCheckCircle className="h-4 w-4" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                            <HiOutlineXCircle className="h-4 w-4" /> Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {empList.length === 0 && (
                  <tr>
                    <td colSpan={isSuperadmin ? 7 : 6} className="px-4 py-8 text-center text-sm text-gray-400">
                      No hay empleados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
          {selected.size > 0 && (
            <p className="mt-3 text-sm text-gray-400">
              {selected.size} empleado{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''} en total (puede incluir otras páginas)
            </p>
          )}
        </>
      )}
    </div>
  );
}

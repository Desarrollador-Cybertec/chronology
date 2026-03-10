import { useEffect, useState, useCallback } from 'react';
import { sileo } from 'sileo';
import { employees as employeesApi, shifts as shiftsApi, shiftAssignments } from '@/api/endpoints';
import type { Employee, Shift, ShiftAssignment, PaginationMeta } from '@/types/api';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTable } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftAssignmentPageSteps, shiftAssignmentPageAdminSteps } from '@/data/pageTutorials';
import SortableHeader from '@/components/ui/SortableHeader';
import AssignShiftForm from './AssignShiftForm';
import type { AssignFormData } from './AssignShiftForm';
import EmployeeAssignRow from './EmployeeAssignRow';
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

function getCurrentAssignment(assignments: ShiftAssignment[] | undefined) {
  if (!assignments?.length) return undefined;
  const today = new Date().toISOString().slice(0, 10);
  return assignments.find(
    (a) => a.effective_date <= today && (!a.end_date || a.end_date >= today),
  );
}

export default function ShiftAssignmentPage() {
  const { isSuperadmin } = useAuth();
  const [empList, setEmpList] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignmentMap, setAssignmentMap] = useState<Record<number, ShiftAssignment[]>>({});
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

  const displaySortKey = sortKey === 'current_shift' ? 'shift' : sortKey === 'last_name' ? 'name' : sortKey;

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  const fetchEmployeesWithAssignments = useCallback(async () => {
    try {
      const res = await employeesApi.list(page, searchDebounced || undefined, sortKey, sortDir);
      setEmpList(res.data);
      setMeta(res.meta);
      const map: Record<number, ShiftAssignment[]> = {};
      for (const emp of res.data) {
        map[emp.id] = emp.shift_assignments ?? [];
      }
      setAssignmentMap(map);
    } catch {
      sileo.error({ title: 'Error al cargar empleados' });
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced, sortKey, sortDir]);

  useEffect(() => {
    shiftsApi.list(1, 100).then((res) => setShifts(res.data));
  }, []);

  useEffect(() => {
    if (search === searchDebounced) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setSearchDebounced(search);
      _setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, searchDebounced]);

  useEffect(() => {
    fetchEmployeesWithAssignments();
  }, [fetchEmployeesWithAssignments]);

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
      setLoading(true);
      fetchEmployeesWithAssignments();
    }
  };

  const handleUnassign = async (assignmentId: number, empName: string) => {
    if (!confirm(`¿Desasignar turno de ${empName}?`)) return;
    try {
      await shiftAssignments.delete(assignmentId);
      sileo.success({ title: `Turno desasignado de ${empName}` });
      setLoading(true);
      fetchEmployeesWithAssignments();
    } catch {
      sileo.error({ title: 'Error al desasignar turno' });
    }
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

      {isSuperadmin && (
        <AssignShiftForm
          shifts={shifts}
          selectedCount={selected.size}
          assigning={assigning}
          onSubmit={onSubmit}
        />
      )}

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
                  {isSuperadmin && <th className="px-4 py-3">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {empList.map((emp) => (
                  <EmployeeAssignRow
                    key={emp.id}
                    emp={emp}
                    assignment={getCurrentAssignment(assignmentMap[emp.id])}
                    shifts={shifts}
                    isSelected={selected.has(emp.id)}
                    isSuperadmin={isSuperadmin}
                    onToggle={toggleEmployee}
                    onUnassign={handleUnassign}
                  />
                ))}
                {empList.length === 0 && (
                  <tr>
                    <td colSpan={isSuperadmin ? 8 : 6} className="px-4 py-8 text-center text-sm text-gray-400">
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

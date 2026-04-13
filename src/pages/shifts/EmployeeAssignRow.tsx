import type { Employee, Shift, ShiftAssignment } from '@/types/api';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineTrash,
} from 'react-icons/hi2';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface EmployeeAssignRowProps {
  emp: Employee;
  assignments: ShiftAssignment[];
  shifts: Shift[];
  isSelected: boolean;
  isSuperadmin: boolean;
  onToggle: (id: number) => void;
  onUnassign?: (assignmentId: number, empName: string) => void;
}

export default function EmployeeAssignRow({ emp, assignments, shifts, isSelected, isSuperadmin, onToggle, onUnassign }: EmployeeAssignRowProps) {
  const today = new Date().toISOString().slice(0, 10);

  const activeAssignments = assignments.filter(
    (a) => a.effective_date <= today && (!a.end_date || a.end_date >= today),
  );

  // Fallback: show most recent expired if nothing is active
  const displayAssignments = activeAssignments.length > 0
    ? activeAssignments
    : assignments.length > 0
    ? [[...assignments].sort((a, b) => b.effective_date.localeCompare(a.effective_date))[0]]
    : [];

  const isAllExpired = displayAssignments.length > 0 && activeAssignments.length === 0;

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-radar/5' : 'hover:bg-grafito-lighter'} ${!emp.is_active ? 'opacity-50' : ''}`}>
      {isSuperadmin && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(emp.id)}
            disabled={!emp.is_active}
            className="h-4 w-4 rounded border-white/10 bg-grafito-light accent-radar cursor-pointer disabled:opacity-30"
          />
        </td>
      )}
      <td className="px-4 py-3 text-gray-400">{emp.internal_id}</td>
      <td className="px-4 py-3 font-medium text-white">{emp.first_name} {emp.last_name}</td>
      <td className="px-4 py-3 text-gray-300">{emp.department ?? '—'}</td>
      <td className="px-4 py-3">
        {displayAssignments.length === 0 ? (
          <span className="inline-flex items-center gap-1 text-sm text-amber-400">
            <HiOutlineXCircle className="h-4 w-4" /> Sin turno
          </span>
        ) : (
          <div className="flex flex-col gap-1.5">
            {displayAssignments.map((a) => {
              const shift = a.shift ?? shifts.find((s) => s.id === a.shift_id);
              const expired = isAllExpired;
              return (
                <span key={a.id} className={`inline-flex flex-wrap items-center gap-1.5 text-sm ${expired ? 'opacity-50' : ''}`}>
                  <HiOutlineClock className={`h-4 w-4 shrink-0 ${expired ? 'text-gray-400' : 'text-radar'}`} />
                  <span className={expired ? 'text-gray-400' : 'text-white'}>{shift?.name ?? `#${a.shift_id}`}</span>
                  {shift && <span className="text-gray-400">({shift.start_time} – {shift.end_time})</span>}
                  {a.work_days.length > 0 && (
                    <span className="rounded bg-grafito-lighter px-1.5 py-0.5 text-[10px] font-medium text-gray-300">
                      {a.work_days.map((d) => DAY_NAMES[d]).join(', ')}
                    </span>
                  )}
                  {expired && <span className="rounded bg-gray-600/30 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">Vencido</span>}
                </span>
              );
            })}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {displayAssignments.length === 0
          ? '—'
          : displayAssignments.length === 1
          ? <>
              {displayAssignments[0].effective_date}
              {displayAssignments[0].end_date ? ` → ${displayAssignments[0].end_date}` : ' → ∞'}
            </>
          : <span className="text-gray-300">{displayAssignments.length} asignaciones</span>}
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
      {isSuperadmin && (
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            {displayAssignments.map((a) => (
              <button
                key={a.id}
                type="button"
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                title={displayAssignments.length > 1 ? `Eliminar asignación #${a.id}` : 'Desasignar turno'}
                onClick={() => onUnassign?.(a.id, `${emp.first_name} ${emp.last_name}`)}
              >
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}

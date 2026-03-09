import type { Employee, ShiftAssignment } from '@/types/api';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineTrash,
} from 'react-icons/hi2';

interface EmployeeAssignRowProps {
  emp: Employee;
  assignment: ShiftAssignment | undefined;
  isSelected: boolean;
  isSuperadmin: boolean;
  onToggle: (id: number) => void;
  onUnassign?: (assignmentId: number, empName: string) => void;
}

export default function EmployeeAssignRow({ emp, assignment, isSelected, isSuperadmin, onToggle, onUnassign }: EmployeeAssignRowProps) {
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
      {isSuperadmin && (
        <td className="px-4 py-3">
          {assignment && (
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
              title="Desasignar turno"
              onClick={() => onUnassign?.(assignment.id, `${emp.first_name} ${emp.last_name}`)}
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

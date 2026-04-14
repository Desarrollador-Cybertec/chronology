import { useEffect, useState, useCallback } from 'react';
import { sileo } from 'sileo';
import { HiOutlineXMark } from 'react-icons/hi2';
import { employees, scheduleExceptions } from '@/api/endpoints';
import type { Employee } from '@/types/api';
import { INPUT_BASE } from '@/constants/ui';
import { useDateBounds } from '@/hooks/useDateBounds';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /**
   * If provided, the modal skips the employee search and creates the exception
   * for this employee id directly.
   */
  employeeId?: number;
}

export default function ExceptionFormModal({ open, onClose, onCreated, employeeId }: Props) {
  const { minDate, maxDate } = useDateBounds();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);

  const [formDate, setFormDate] = useState('');
  const [formIsWorkingDay, setFormIsWorkingDay] = useState(false);
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedEmployee(null);
    setEmployeeSearch('');
    setEmployeeResults([]);
    setFormDate('');
    setFormIsWorkingDay(false);
    setFormReason('');
  }, []);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const searchEmployees = useCallback(async (query: string) => {
    if (query.length < 2) { setEmployeeResults([]); return; }
    try {
      const res = await employees.list(1, query);
      setEmployeeResults(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (employeeId !== undefined) return;
    const timeout = setTimeout(() => { searchEmployees(employeeSearch); }, 300);
    return () => clearTimeout(timeout);
  }, [employeeSearch, searchEmployees, employeeId]);

  const handleCreate = async () => {
    const targetId = employeeId ?? selectedEmployee?.id;
    if (!targetId) { sileo.error({ title: 'Selecciona un empleado' }); return; }
    if (!formDate) { sileo.error({ title: 'La fecha es requerida' }); return; }

    setSubmitting(true);
    try {
      await scheduleExceptions.create({
        employee_id: targetId,
        date: formDate,
        is_working_day: formIsWorkingDay,
        reason: formReason || undefined,
      });
      sileo.success({ title: 'Excepción creada' });
      onCreated();
      onClose();
    } catch {
      sileo.error({ title: 'Error al crear excepción' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-grafito p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Nueva excepción de horario</h3>
          <button type="button" className="text-gray-400 hover:text-white cursor-pointer" onClick={onClose}>
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {employeeId === undefined && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Empleado</label>
              {selectedEmployee ? (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-grafito-light px-3 py-2">
                  <span className="text-sm text-white">
                    {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.internal_id})
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white cursor-pointer"
                    onClick={() => { setSelectedEmployee(null); setEmployeeSearch(''); }}
                  >
                    <HiOutlineXMark className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o ID..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className={`w-full ${INPUT_BASE}`}
                  />
                  {employeeResults.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/10 bg-grafito-light shadow-lg">
                      {employeeResults.map((emp) => (
                        <li key={emp.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-grafito-lighter cursor-pointer"
                            onClick={() => { setSelectedEmployee(emp); setEmployeeSearch(''); setEmployeeResults([]); }}
                          >
                            {emp.first_name} {emp.last_name} — {emp.internal_id}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Fecha</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className={`w-full ${INPUT_BASE}`}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsWorkingDay}
                onChange={(e) => setFormIsWorkingDay(e.target.checked)}
                className="rounded"
              />
              Es día laborable
            </label>
            <span className="mt-1 block text-xs text-gray-400">
              {formIsWorkingDay
                ? 'El empleado debe trabajar este día (ej: día extra)'
                : 'El empleado no trabaja este día (ej: permiso, feriado)'}
            </span>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Motivo (opcional)</label>
            <textarea
              rows={2}
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              className={`w-full ${INPUT_BASE}`}
              placeholder="Ej: Permiso personal, feriado empresa..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter cursor-pointer"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer"
              disabled={submitting}
              onClick={handleCreate}
            >
              {submitting ? 'Creando...' : 'Crear excepción'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

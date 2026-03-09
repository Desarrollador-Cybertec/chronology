import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { shiftAssignments, shifts as shiftsApi } from '@/api/endpoints';
import { shiftAssignmentSchema, type ShiftAssignmentFormData } from '@/schemas/assignments';
import type { Shift } from '@/types/api';
import TutorialModal from '@/components/ui/TutorialModal';
import { assignShiftSteps } from '@/data/pageTutorials';

const inputBase = 'w-full rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

const DAY_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function AssignShiftPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShiftAssignmentFormData>({
    resolver: zodResolver(shiftAssignmentSchema) as Resolver<ShiftAssignmentFormData>,
    defaultValues: {
      employee_id: Number(employeeId),
      work_days: [1, 2, 3, 4, 5],
    },
  });

  const workDays = useWatch({ control, name: 'work_days' });

  useEffect(() => {
    shiftsApi.list(1).then((res) => setShifts(res.data));
  }, []);

  const toggleDay = (day: number) => {
    const current = workDays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setValue('work_days', next, { shouldValidate: true });
  };

  const onSubmit = async (data: ShiftAssignmentFormData) => {
    try {
      await shiftAssignments.create({
        ...data,
        end_date: data.end_date || undefined,
      });
      sileo.success({ title: 'Turno asignado' });
      navigate(`/employees/${employeeId}`);
    } catch {
      sileo.error({ title: 'Error al asignar turno' });
    }
  };

  return (
    <div>
      <Link to={`/employees/${employeeId}`} className="text-sm text-radar hover:underline">← Volver</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Asignar turno</h2>
        <TutorialModal steps={assignShiftSteps} />
      </div>

      <div className="mt-6 max-w-2xl rounded-xl bg-grafito p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" {...register('employee_id')} />

          <div>
            <label htmlFor="shift_id" className="mb-1 block text-sm font-medium text-gray-300">Turno</label>
            <select id="shift_id" {...register('shift_id')} className={`${inputBase} ${errors.shift_id ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar turno...</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
              ))}
            </select>
            {errors.shift_id && <span className="mt-1 block text-xs text-red-500">{errors.shift_id.message}</span>}
          </div>

          <div>
            <label htmlFor="effective_date" className="mb-1 block text-sm font-medium text-gray-300">Fecha de inicio</label>
            <input id="effective_date" type="date" {...register('effective_date')} className={`${inputBase} ${errors.effective_date ? 'border-red-400' : ''}`} />
            {errors.effective_date && <span className="mt-1 block text-xs text-red-500">{errors.effective_date.message}</span>}
          </div>

          <div>
            <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-gray-300">Fecha fin (opcional)</label>
            <input id="end_date" type="date" {...register('end_date')} className={inputBase} />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Días laborables</label>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                    workDays?.includes(d.value)
                      ? 'border-radar bg-radar/10 text-radar-dark'
                      : 'border-white/10 text-gray-400 hover:bg-grafito-lighter'
                  }`}
                  onClick={() => toggleDay(d.value)}
                >
                  {d.label.slice(0, 3)}
                </button>
              ))}
            </div>
            {errors.work_days && <span className="mt-1 block text-xs text-red-500">{errors.work_days.message}</span>}
          </div>

          <div className="flex gap-3 pt-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Asignando...' : 'Asignar turno'}
            </button>
            <Link to={`/employees/${employeeId}`} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

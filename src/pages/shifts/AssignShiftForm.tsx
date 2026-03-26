import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Shift } from '@/types/api';
import { INPUT_BASE, DAY_OPTIONS } from '@/constants/ui';
import { useDateBounds } from '@/hooks/useDateBounds';

const assignSchema = z.object({
  shift_id: z.coerce.number().min(1, 'Selecciona un turno'),
  effective_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional().or(z.literal('')),
  work_days: z.array(z.number().min(0).max(6)).min(1, 'Selecciona al menos un día'),
});

export type AssignFormData = z.infer<typeof assignSchema>;

interface AssignShiftFormProps {
  shifts: Shift[];
  selectedCount: number;
  assigning: boolean;
  onSubmit: (data: AssignFormData) => void;
}

export default function AssignShiftForm({ shifts, selectedCount, assigning, onSubmit }: AssignShiftFormProps) {
  const { minDate, maxDate } = useDateBounds();
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

  const toggleDay = (day: number) => {
    const current = workDays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setValue('work_days', next, { shouldValidate: true });
  };

  return (
    <div className="mt-6 rounded-xl bg-grafito p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-white">Asignar turno a empleados seleccionados</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4">
        <div className="min-w-45 flex-1">
          <label htmlFor="shift_id" className="mb-1 block text-xs font-medium text-gray-300">Turno</label>
          <select id="shift_id" {...register('shift_id')} className={`${INPUT_BASE} ${errors.shift_id ? 'border-red-400' : ''}`}>
            <option value="">Seleccionar turno...</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.start_time} – {s.end_time})</option>
            ))}
          </select>
          {errors.shift_id && <span className="mt-1 block text-xs text-red-400">{errors.shift_id.message}</span>}
        </div>

        <div className="min-w-37.5">
          <label htmlFor="effective_date" className="mb-1 block text-xs font-medium text-gray-300">Fecha inicio</label>
          <input id="effective_date" type="date" {...register('effective_date')} min={minDate} max={maxDate} className={`${INPUT_BASE} ${errors.effective_date ? 'border-red-400' : ''}`} />
          {errors.effective_date && <span className="mt-1 block text-xs text-red-400">{errors.effective_date.message}</span>}
        </div>

        <div className="min-w-37.5">
          <label htmlFor="end_date" className="mb-1 block text-xs font-medium text-gray-300">Fecha fin (opc.)</label>
          <input id="end_date" type="date" {...register('end_date')} min={minDate} max={maxDate} className={INPUT_BASE} />
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
          disabled={assigning || selectedCount === 0}
        >
          {assigning ? 'Asignando...' : `Asignar a ${selectedCount} empleado${selectedCount !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sileo } from 'sileo';
import { shiftAssignments, shifts as shiftsApi } from '@/api/endpoints';
import type { Shift } from '@/types/api';
import { INPUT_BASE } from '@/constants/ui';
import { useDateBounds } from '@/hooks/useDateBounds';

const DAY_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const editSchema = z.object({
  shift_id: z.coerce.number().min(1, 'Selecciona un turno'),
  effective_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional().or(z.literal('')),
  work_days: z.array(z.number().min(0).max(6)).min(1, 'Selecciona al menos un día'),
});

type EditFormData = z.infer<typeof editSchema>;

export default function ShiftAssignmentEditPage() {
  const { employeeId, assignmentId } = useParams<{ employeeId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { minDate, maxDate } = useDateBounds();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema) as Resolver<EditFormData>,
    defaultValues: { work_days: [] },
  });

  const workDays = useWatch({ control, name: 'work_days' });

  useEffect(() => {
    if (!assignmentId) return;
    Promise.all([
      shiftAssignments.get(Number(assignmentId)),
      shiftsApi.list(1),
    ])
      .then(([assignRes, shiftsRes]) => {
        const a = assignRes.data;
        setShifts(shiftsRes.data);
        reset({
          shift_id: a.shift_id,
          effective_date: a.effective_date,
          end_date: a.end_date ?? '',
          work_days: a.work_days,
        });
      })
      .catch(() => sileo.error({ title: 'Error al cargar asignación' }))
      .finally(() => setLoading(false));
  }, [assignmentId, reset]);

  const toggleDay = (day: number) => {
    const current = workDays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setValue('work_days', next, { shouldValidate: true });
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      await shiftAssignments.update(Number(assignmentId), {
        shift_id: data.shift_id,
        effective_date: data.effective_date,
        end_date: data.end_date || undefined,
        work_days: data.work_days,
      });
      sileo.success({ title: 'Turno actualizado' });
      navigate(`/employees/${employeeId}`);
    } catch {
      sileo.error({ title: 'Error al actualizar turno' });
    }
  };

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div>
      <Link to={`/employees/${employeeId}`} className="text-sm text-radar hover:underline">← Volver</Link>
      <h2 className="mt-1 text-2xl font-bold text-white">Editar asignación de turno</h2>

      <div className="mt-6 max-w-2xl rounded-xl bg-grafito p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shift_id" className="mb-1 block text-sm font-medium text-gray-300">Turno</label>
            <select id="shift_id" {...register('shift_id')} className={`${INPUT_BASE} ${errors.shift_id ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar turno...</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
              ))}
            </select>
            {errors.shift_id && <span className="mt-1 block text-xs text-red-500">{errors.shift_id.message}</span>}
          </div>

          <div>
            <label htmlFor="effective_date" className="mb-1 block text-sm font-medium text-gray-300">Fecha de inicio</label>
            <input id="effective_date" type="date" {...register('effective_date')} min={minDate} max={maxDate} className={`${INPUT_BASE} ${errors.effective_date ? 'border-red-400' : ''}`} />
            {errors.effective_date && <span className="mt-1 block text-xs text-red-500">{errors.effective_date.message}</span>}
          </div>

          <div>
            <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-gray-300">Fecha fin (opcional)</label>
            <input id="end_date" type="date" {...register('end_date')} min={minDate} max={maxDate} className={INPUT_BASE} />
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
            {errors.work_days && <span className="mt-1 block text-xs text-red-500">{String(errors.work_days.message)}</span>}
          </div>

          <div className="sm:col-span-2 flex justify-end gap-3">
            <Link to={`/employees/${employeeId}`} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

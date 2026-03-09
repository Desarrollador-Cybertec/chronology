import { useNavigate, Link } from 'react-router';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { shifts } from '@/api/endpoints';
import { shiftSchema, type ShiftFormData } from '@/schemas/shifts';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftFormSteps } from '@/data/pageTutorials';
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi2';

const inputBase = 'w-full rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

const BREAK_TYPES = [
  { value: 'morning_snack', label: 'Merienda mañana' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'afternoon_snack', label: 'Merienda tarde' },
  { value: 'other', label: 'Otro' },
];

export default function ShiftFormPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema) as Resolver<ShiftFormData>,
    defaultValues: {
      crosses_midnight: false,
      lunch_required: false,
      lunch_duration_minutes: 60,
      tolerance_minutes: 5,
      overtime_enabled: true,
      overtime_min_block_minutes: 30,
      max_daily_overtime_minutes: 120,
      is_active: true,
      breaks: [],
    },
  });

  const lunchRequired = useWatch({ control, name: 'lunch_required' });

  const { fields, append, remove } = useFieldArray({ control, name: 'breaks' });

  const onSubmit = async (data: ShiftFormData) => {
    try {
      const payload = { ...data };
      if (!payload.lunch_required) {
        payload.lunch_start_time = undefined;
        payload.lunch_end_time = undefined;
        payload.lunch_duration_minutes = 0;
      }
      // Set position based on array index
      if (payload.breaks) {
        payload.breaks = payload.breaks.map((b, i) => ({ ...b, position: i }));
      }
      await shifts.create(payload);
      sileo.success({ title: 'Turno creado' });
      navigate('/shifts');
    } catch {
      sileo.error({ title: 'Error al crear turno' });
    }
  };

  return (
    <div>
      <Link to="/shifts" className="text-sm text-radar hover:underline">← Turnos</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Nuevo turno</h2>
        <TutorialModal steps={shiftFormSteps} />
      </div>

      <div className="mt-6 max-w-2xl rounded-xl bg-grafito p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-300">Nombre</label>
            <input id="name" {...register('name')} className={`${inputBase} ${errors.name ? 'border-red-400' : ''}`} />
            {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div>
            <label htmlFor="start_time" className="mb-1 block text-sm font-medium text-gray-300">Hora de entrada</label>
            <input id="start_time" type="time" {...register('start_time')} className={`${inputBase} ${errors.start_time ? 'border-red-400' : ''}`} />
            {errors.start_time && <span className="mt-1 block text-xs text-red-500">{errors.start_time.message}</span>}
          </div>

          <div>
            <label htmlFor="end_time" className="mb-1 block text-sm font-medium text-gray-300">Hora de salida</label>
            <input id="end_time" type="time" {...register('end_time')} className={`${inputBase} ${errors.end_time ? 'border-red-400' : ''}`} />
            {errors.end_time && <span className="mt-1 block text-xs text-red-500">{errors.end_time.message}</span>}
          </div>

          <div>
            <label htmlFor="tolerance_minutes" className="mb-1 block text-sm font-medium text-gray-300">Tolerancia (min)</label>
            <input id="tolerance_minutes" type="number" {...register('tolerance_minutes')} className={inputBase} />
            {errors.tolerance_minutes && <span className="mt-1 block text-xs text-red-500">{errors.tolerance_minutes.message}</span>}
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...register('crosses_midnight')} className="rounded" />
              Cruza medianoche
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...register('lunch_required')} className="rounded" />
              Requiere almuerzo (legacy)
            </label>
          </div>

          {lunchRequired && (
            <>
              <div>
                <label htmlFor="lunch_start_time" className="mb-1 block text-sm font-medium text-gray-300">Inicio almuerzo</label>
                <input id="lunch_start_time" type="time" {...register('lunch_start_time')} className={inputBase} />
              </div>
              <div>
                <label htmlFor="lunch_end_time" className="mb-1 block text-sm font-medium text-gray-300">Fin almuerzo</label>
                <input id="lunch_end_time" type="time" {...register('lunch_end_time')} className={inputBase} />
              </div>
              <div>
                <label htmlFor="lunch_duration_minutes" className="mb-1 block text-sm font-medium text-gray-300">Duración almuerzo (min)</label>
                <input id="lunch_duration_minutes" type="number" {...register('lunch_duration_minutes')} className={inputBase} />
              </div>
            </>
          )}

          {/* Break Blocks Section */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Bloques de descanso</h3>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-grafito-lighter cursor-pointer"
                onClick={() => append({ type: 'lunch', start_time: '12:00', end_time: '12:30', duration_minutes: 30, position: fields.length })}
              >
                <HiOutlinePlusCircle className="h-4 w-4" /> Agregar bloque
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Si se definen bloques de descanso, estos tienen prioridad sobre la configuración de almuerzo legacy.</p>

            {fields.length > 0 && (
              <div className="mt-3 space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-white/10 bg-grafito-light p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">Bloque {index + 1}</span>
                      <button type="button" className="text-red-400 hover:text-red-300 cursor-pointer" onClick={() => remove(index)}>
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Tipo</label>
                        <select {...register(`breaks.${index}.type`)} className={inputBase}>
                          {BREAK_TYPES.map((bt) => (
                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                          ))}
                        </select>
                        {errors.breaks?.[index]?.type && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].type.message}</span>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Inicio</label>
                        <input type="time" {...register(`breaks.${index}.start_time`)} className={inputBase} />
                        {errors.breaks?.[index]?.start_time && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].start_time.message}</span>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Fin</label>
                        <input type="time" {...register(`breaks.${index}.end_time`)} className={inputBase} />
                        {errors.breaks?.[index]?.end_time && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].end_time.message}</span>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Duración (min)</label>
                        <input type="number" {...register(`breaks.${index}.duration_minutes`)} className={inputBase} />
                        {errors.breaks?.[index]?.duration_minutes && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].duration_minutes.message}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...register('overtime_enabled')} className="rounded" />
              Horas extra habilitadas
            </label>
          </div>

          <div>
            <label htmlFor="overtime_min_block_minutes" className="mb-1 block text-sm font-medium text-gray-300">Bloque mínimo HE (min)</label>
            <input id="overtime_min_block_minutes" type="number" {...register('overtime_min_block_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="max_daily_overtime_minutes" className="mb-1 block text-sm font-medium text-gray-300">Máximo diario HE (min)</label>
            <input id="max_daily_overtime_minutes" type="number" {...register('max_daily_overtime_minutes')} className={inputBase} />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...register('is_active')} className="rounded" />
              Turno activo
            </label>
          </div>

          <div className="flex gap-3 pt-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear turno'}
            </button>
            <Link to="/shifts" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

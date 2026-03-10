import { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import type { UseFormRegister, Control, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { ShiftFormData } from '@/schemas/shifts';
import { Link } from 'react-router';
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi2';
import { INPUT_BASE, BREAK_TYPES } from '@/constants/ui';

interface ShiftFormProps {
  register: UseFormRegister<ShiftFormData>;
  control: Control<ShiftFormData>;
  watch: UseFormWatch<ShiftFormData>;
  setValue: UseFormSetValue<ShiftFormData>;
  errors: FieldErrors<ShiftFormData>;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  submittingLabel: string;
}

export default function ShiftForm({
  register, control, watch, setValue, errors, isSubmitting, onSubmit, submitLabel, submittingLabel,
}: ShiftFormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'breaks' });
  const watchedBreaks = watch('breaks');

  useEffect(() => {
    watchedBreaks?.forEach((b, i) => {
      if (b.start_time && b.end_time) {
        const [sh, sm] = b.start_time.split(':').map(Number);
        const [eh, em] = b.end_time.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        const duration = diff > 0 ? diff : 0;
        if (duration !== b.duration_minutes) {
          setValue(`breaks.${i}.duration_minutes`, duration);
        }
      }
    });
  }, [watchedBreaks, setValue]);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-300">Nombre</label>
        <input id="name" {...register('name')} className={`${INPUT_BASE} ${errors.name ? 'border-red-400' : ''}`} />
        {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="start_time" className="mb-1 block text-sm font-medium text-gray-300">Hora de entrada</label>
        <input id="start_time" type="time" {...register('start_time')} className={`${INPUT_BASE} ${errors.start_time ? 'border-red-400' : ''}`} />
        {errors.start_time && <span className="mt-1 block text-xs text-red-500">{errors.start_time.message}</span>}
      </div>

      <div>
        <label htmlFor="end_time" className="mb-1 block text-sm font-medium text-gray-300">Hora de salida</label>
        <input id="end_time" type="time" {...register('end_time')} className={`${INPUT_BASE} ${errors.end_time ? 'border-red-400' : ''}`} />
        {errors.end_time && <span className="mt-1 block text-xs text-red-500">{errors.end_time.message}</span>}
      </div>

      <div>
        <label htmlFor="tolerance_minutes" className="mb-1 block text-sm font-medium text-gray-300">Tolerancia (min)</label>
        <input id="tolerance_minutes" type="number" {...register('tolerance_minutes')} className={INPUT_BASE} />
        {errors.tolerance_minutes && <span className="mt-1 block text-xs text-red-500">{errors.tolerance_minutes.message}</span>}
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" {...register('crosses_midnight')} className="rounded" />
          Cruza medianoche
        </label>
      </div>

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
        <p className="mt-1 text-xs text-gray-500">Define los bloques de descanso del turno (almuerzo, meriendas, etc.).</p>

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
                    <select {...register(`breaks.${index}.type`)} className={INPUT_BASE}>
                      {BREAK_TYPES.map((bt) => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                    {errors.breaks?.[index]?.type && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].type.message}</span>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Inicio</label>
                    <input type="time" {...register(`breaks.${index}.start_time`)} className={INPUT_BASE} />
                    {errors.breaks?.[index]?.start_time && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].start_time.message}</span>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Fin</label>
                    <input type="time" {...register(`breaks.${index}.end_time`)} className={INPUT_BASE} />
                    {errors.breaks?.[index]?.end_time && <span className="mt-1 block text-xs text-red-400">{errors.breaks[index].end_time.message}</span>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Duración (min)</label>
                    <input type="number" {...register(`breaks.${index}.duration_minutes`)} className={`${INPUT_BASE} bg-white/5`} readOnly />
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
        <input id="overtime_min_block_minutes" type="number" {...register('overtime_min_block_minutes')} className={INPUT_BASE} />
      </div>

      <div>
        <label htmlFor="max_daily_overtime_minutes" className="mb-1 block text-sm font-medium text-gray-300">Máximo diario HE (min)</label>
        <input id="max_daily_overtime_minutes" type="number" {...register('max_daily_overtime_minutes')} className={INPUT_BASE} />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" {...register('is_active')} className="rounded" />
          Turno activo
        </label>
      </div>

      <div className="flex gap-3 pt-2 sm:col-span-2">
        <button type="submit" className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        <Link to="/shifts" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter">Cancelar</Link>
      </div>
    </form>
  );
}

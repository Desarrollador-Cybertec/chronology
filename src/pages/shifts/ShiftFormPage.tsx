import { useNavigate, Link } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { shifts } from '@/api/endpoints';
import { shiftSchema, type ShiftFormData } from '@/schemas/shifts';

const inputBase = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500';

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
    },
  });

  const lunchRequired = useWatch({ control, name: 'lunch_required' });

  const onSubmit = async (data: ShiftFormData) => {
    try {
      const payload = { ...data };
      if (!payload.lunch_required) {
        payload.lunch_start_time = undefined;
        payload.lunch_end_time = undefined;
        payload.lunch_duration_minutes = 0;
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
      <Link to="/shifts" className="text-sm text-indigo-600 hover:underline">← Turnos</Link>
      <h2 className="mt-1 text-2xl font-bold text-gray-900">Nuevo turno</h2>

      <div className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input id="name" {...register('name')} className={`${inputBase} ${errors.name ? 'border-red-400' : ''}`} />
            {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div>
            <label htmlFor="start_time" className="mb-1 block text-sm font-medium text-gray-700">Hora de entrada</label>
            <input id="start_time" type="time" {...register('start_time')} className={`${inputBase} ${errors.start_time ? 'border-red-400' : ''}`} />
            {errors.start_time && <span className="mt-1 block text-xs text-red-500">{errors.start_time.message}</span>}
          </div>

          <div>
            <label htmlFor="end_time" className="mb-1 block text-sm font-medium text-gray-700">Hora de salida</label>
            <input id="end_time" type="time" {...register('end_time')} className={`${inputBase} ${errors.end_time ? 'border-red-400' : ''}`} />
            {errors.end_time && <span className="mt-1 block text-xs text-red-500">{errors.end_time.message}</span>}
          </div>

          <div>
            <label htmlFor="tolerance_minutes" className="mb-1 block text-sm font-medium text-gray-700">Tolerancia (min)</label>
            <input id="tolerance_minutes" type="number" {...register('tolerance_minutes')} className={inputBase} />
            {errors.tolerance_minutes && <span className="mt-1 block text-xs text-red-500">{errors.tolerance_minutes.message}</span>}
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('crosses_midnight')} className="rounded" />
              Cruza medianoche
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('lunch_required')} className="rounded" />
              Requiere almuerzo
            </label>
          </div>

          {lunchRequired && (
            <>
              <div>
                <label htmlFor="lunch_start_time" className="mb-1 block text-sm font-medium text-gray-700">Inicio almuerzo</label>
                <input id="lunch_start_time" type="time" {...register('lunch_start_time')} className={inputBase} />
              </div>
              <div>
                <label htmlFor="lunch_end_time" className="mb-1 block text-sm font-medium text-gray-700">Fin almuerzo</label>
                <input id="lunch_end_time" type="time" {...register('lunch_end_time')} className={inputBase} />
              </div>
              <div>
                <label htmlFor="lunch_duration_minutes" className="mb-1 block text-sm font-medium text-gray-700">Duración almuerzo (min)</label>
                <input id="lunch_duration_minutes" type="number" {...register('lunch_duration_minutes')} className={inputBase} />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('overtime_enabled')} className="rounded" />
              Horas extra habilitadas
            </label>
          </div>

          <div>
            <label htmlFor="overtime_min_block_minutes" className="mb-1 block text-sm font-medium text-gray-700">Bloque mínimo HE (min)</label>
            <input id="overtime_min_block_minutes" type="number" {...register('overtime_min_block_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="max_daily_overtime_minutes" className="mb-1 block text-sm font-medium text-gray-700">Máximo diario HE (min)</label>
            <input id="max_daily_overtime_minutes" type="number" {...register('max_daily_overtime_minutes')} className={inputBase} />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('is_active')} className="rounded" />
              Turno activo
            </label>
          </div>

          <div className="flex gap-3 pt-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear turno'}
            </button>
            <Link to="/shifts" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

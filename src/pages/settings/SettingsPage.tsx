import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { settings } from '@/api/endpoints';
import { settingSchema, type SettingsFormData } from '@/schemas/settings';
import { HiOutlineCog6Tooth, HiOutlineCheckCircle } from 'react-icons/hi2';
import { SkeletonForm } from '@/components/ui/Skeleton';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingSchema) as Resolver<SettingsFormData>,
  });

  useEffect(() => {
    settings.list()
      .then((res) => {
        const values: Record<string, string> = {};
        res.data.forEach((s) => { values[s.key] = s.value; });
        reset({
          noise_window_minutes: Number(values.noise_window_minutes ?? 60),
          auto_assign_shift: (values.auto_assign_shift ?? 'true') as 'true' | 'false',
          auto_assign_tolerance_minutes: Number(values.auto_assign_tolerance_minutes ?? 60),
          lunch_margin_minutes: Number(values.lunch_margin_minutes ?? 15),
          diurnal_start_time: values.diurnal_start_time ?? '06:00',
          nocturnal_start_time: values.nocturnal_start_time ?? '20:00',
          data_retention_months: Number(values.data_retention_months ?? 24),
        });
      })
      .catch(() => sileo.error({ title: 'Error al cargar configuración' }))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const settingsData = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await settings.update(settingsData);
      sileo.success({ title: 'Configuración actualizada' });
    } catch {
      sileo.error({ title: 'Error al guardar' });
    }
  };

  const inputBase = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500';

  if (loading) return (
    <div>
      <div className="flex items-center gap-2">
        <HiOutlineCog6Tooth className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
      </div>
      <SkeletonForm fields={6} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        <HiOutlineCog6Tooth className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
      </div>

      <div className="mt-6 max-w-3xl rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900">Asistencia</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="noise_window_minutes" className="mb-1 block text-sm font-medium text-gray-700">Ventana de ruido (min)</label>
                <input id="noise_window_minutes" type="number" {...register('noise_window_minutes')} className={inputBase} />
                <span className="mt-1 block text-xs text-gray-400">Filtra marcajes duplicados dentro de esta ventana</span>
                {errors.noise_window_minutes && <span className="mt-1 block text-xs text-red-500">{errors.noise_window_minutes.message}</span>}
              </div>

              <div>
                <label htmlFor="auto_assign_shift" className="mb-1 block text-sm font-medium text-gray-700">Auto-asignar turno</label>
                <select id="auto_assign_shift" {...register('auto_assign_shift')} className={inputBase}>
                  <option value="true">Habilitado</option>
                  <option value="false">Deshabilitado</option>
                </select>
                <span className="mt-1 block text-xs text-gray-400">Asignar turno automáticamente según hora de entrada</span>
              </div>

              <div>
                <label htmlFor="auto_assign_tolerance_minutes" className="mb-1 block text-sm font-medium text-gray-700">Tolerancia auto-asignación (min)</label>
                <input id="auto_assign_tolerance_minutes" type="number" {...register('auto_assign_tolerance_minutes')} className={inputBase} />
                <span className="mt-1 block text-xs text-gray-400">Ventana alrededor del inicio de turno para match</span>
                {errors.auto_assign_tolerance_minutes && <span className="mt-1 block text-xs text-red-500">{errors.auto_assign_tolerance_minutes.message}</span>}
              </div>

              <div>
                <label htmlFor="lunch_margin_minutes" className="mb-1 block text-sm font-medium text-gray-700">Margen almuerzo (min)</label>
                <input id="lunch_margin_minutes" type="number" {...register('lunch_margin_minutes')} className={inputBase} />
                <span className="mt-1 block text-xs text-gray-400">Margen para detectar marcajes de almuerzo</span>
                {errors.lunch_margin_minutes && <span className="mt-1 block text-xs text-red-500">{errors.lunch_margin_minutes.message}</span>}
              </div>

              <div>
                <label htmlFor="diurnal_start_time" className="mb-1 block text-sm font-medium text-gray-700">Inicio período diurno</label>
                <input id="diurnal_start_time" type="time" {...register('diurnal_start_time')} className={inputBase} />
                {errors.diurnal_start_time && <span className="mt-1 block text-xs text-red-500">{errors.diurnal_start_time.message}</span>}
              </div>

              <div>
                <label htmlFor="nocturnal_start_time" className="mb-1 block text-sm font-medium text-gray-700">Inicio período nocturno</label>
                <input id="nocturnal_start_time" type="time" {...register('nocturnal_start_time')} className={inputBase} />
                {errors.nocturnal_start_time && <span className="mt-1 block text-xs text-red-500">{errors.nocturnal_start_time.message}</span>}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-gray-900">General</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="data_retention_months" className="mb-1 block text-sm font-medium text-gray-700">Retención de datos (meses)</label>
                <input id="data_retention_months" type="number" {...register('data_retention_months')} className={inputBase} />
                <span className="mt-1 block text-xs text-gray-400">Meses de retención de datos históricos</span>
                {errors.data_retention_months && <span className="mt-1 block text-xs text-red-500">{errors.data_retention_months.message}</span>}
              </div>
            </div>
          </fieldset>

          <div className="pt-2">
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              <HiOutlineCheckCircle className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { attendance } from '@/api/endpoints';
import { attendanceEditSchema, type AttendanceEditFormData } from '@/schemas/attendance';
import type { AttendanceRecord } from '@/types/api';
import { SkeletonForm } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { attendanceEditSteps } from '@/data/pageTutorials';

const inputBase = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500';

export default function AttendanceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceEditFormData>({
    resolver: zodResolver(attendanceEditSchema) as Resolver<AttendanceEditFormData>,
  });

  useEffect(() => {
    if (!id) return;
    attendance.get(Number(id))
      .then((res) => {
        setRecord(res.data);
        reset({
          first_check_in: res.data.first_check_in?.replace(' ', 'T').slice(0, 16) ?? '',
          last_check_out: res.data.last_check_out?.replace(' ', 'T').slice(0, 16) ?? '',
          worked_minutes: res.data.worked_minutes,
          overtime_minutes: res.data.overtime_minutes,
          overtime_diurnal_minutes: res.data.overtime_diurnal_minutes,
          overtime_nocturnal_minutes: res.data.overtime_nocturnal_minutes,
          late_minutes: res.data.late_minutes,
          early_departure_minutes: res.data.early_departure_minutes,
          status: res.data.status,
          reason: '',
        });
      })
      .catch(() => sileo.error({ title: 'Error al cargar registro' }))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: AttendanceEditFormData) => {
    try {
      const payload: Record<string, unknown> = { reason: data.reason };
      if (data.first_check_in) payload.first_check_in = data.first_check_in;
      if (data.last_check_out) payload.last_check_out = data.last_check_out;
      if (data.worked_minutes !== undefined) payload.worked_minutes = data.worked_minutes;
      if (data.overtime_minutes !== undefined) payload.overtime_minutes = data.overtime_minutes;
      if (data.overtime_diurnal_minutes !== undefined) payload.overtime_diurnal_minutes = data.overtime_diurnal_minutes;
      if (data.overtime_nocturnal_minutes !== undefined) payload.overtime_nocturnal_minutes = data.overtime_nocturnal_minutes;
      if (data.late_minutes !== undefined) payload.late_minutes = data.late_minutes;
      if (data.early_departure_minutes !== undefined) payload.early_departure_minutes = data.early_departure_minutes;
      if (data.status) payload.status = data.status;

      const res = await attendance.update(Number(id), payload);
      sileo.success({ title: 'Registro actualizado', description: `${res.edits_created} cambios registrados` });
      navigate(`/attendance/${id}`);
    } catch {
      sileo.error({ title: 'Error al actualizar' });
    }
  };

  if (loading) return <SkeletonForm fields={8} />;
  if (!record) return <p className="text-gray-500">Registro no encontrado.</p>;

  return (
    <div>
      <Link to={`/attendance/${id}`} className="text-sm text-indigo-600 hover:underline">← Volver</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Editar asistencia — {record.date_reference}</h2>
        <TutorialModal steps={attendanceEditSteps} />
      </div>
      <p className="text-sm text-gray-500">{record.employee.first_name} {record.employee.last_name}</p>

      <div className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_check_in" className="mb-1 block text-sm font-medium text-gray-700">Hora de entrada</label>
            <input id="first_check_in" type="datetime-local" {...register('first_check_in')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="last_check_out" className="mb-1 block text-sm font-medium text-gray-700">Hora de salida</label>
            <input id="last_check_out" type="datetime-local" {...register('last_check_out')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="worked_minutes" className="mb-1 block text-sm font-medium text-gray-700">Minutos trabajados</label>
            <input id="worked_minutes" type="number" {...register('worked_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="late_minutes" className="mb-1 block text-sm font-medium text-gray-700">Tardanza (min)</label>
            <input id="late_minutes" type="number" {...register('late_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="early_departure_minutes" className="mb-1 block text-sm font-medium text-gray-700">Salida temprana (min)</label>
            <input id="early_departure_minutes" type="number" {...register('early_departure_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="overtime_minutes" className="mb-1 block text-sm font-medium text-gray-700">HE Total (min)</label>
            <input id="overtime_minutes" type="number" {...register('overtime_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="overtime_diurnal_minutes" className="mb-1 block text-sm font-medium text-gray-700">HE Diurnas (min)</label>
            <input id="overtime_diurnal_minutes" type="number" {...register('overtime_diurnal_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="overtime_nocturnal_minutes" className="mb-1 block text-sm font-medium text-gray-700">HE Nocturnas (min)</label>
            <input id="overtime_nocturnal_minutes" type="number" {...register('overtime_nocturnal_minutes')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select id="status" {...register('status')} className={inputBase}>
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
              <option value="incomplete">Incompleto</option>
              <option value="rest">Descanso</option>
              <option value="holiday">Feriado</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-700">Motivo de la edición *</label>
            <textarea
              id="reason"
              rows={3}
              {...register('reason')}
              className={`${inputBase} ${errors.reason ? 'border-red-400' : ''}`}
              placeholder="Describa por qué se realiza esta corrección..."
            />
            {errors.reason && <span className="mt-1 block text-xs text-red-500">{errors.reason.message}</span>}
          </div>

          <div className="flex gap-3 pt-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to={`/attendance/${id}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

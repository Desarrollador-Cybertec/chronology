import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { shifts } from '@/api/endpoints';
import { shiftSchema, type ShiftFormData } from '@/schemas/shifts';
import type { Shift } from '@/types/api';
import { SkeletonForm } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftFormSteps } from '@/data/pageTutorials';
import ShiftForm from './ShiftForm';

export default function ShiftEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState<Shift | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema) as Resolver<ShiftFormData>,
  });

  useEffect(() => {
    if (!id) return;
    shifts.get(Number(id)).then((res) => {
      setShift(res.data);
      reset({
        name: res.data.name,
        start_time: res.data.start_time.slice(0, 5),
        end_time: res.data.end_time.slice(0, 5),
        crosses_midnight: res.data.crosses_midnight,
        tolerance_minutes: res.data.tolerance_minutes,
        overtime_enabled: res.data.overtime_enabled,
        overtime_min_block_minutes: res.data.overtime_min_block_minutes ?? 30,
        max_daily_overtime_minutes: res.data.max_daily_overtime_minutes ?? 120,
        is_active: res.data.is_active,
        breaks: (res.data.breaks ?? []).map((b) => ({
          type: b.type,
          start_time: b.start_time.slice(0, 5),
          end_time: b.end_time.slice(0, 5),
          duration_minutes: b.duration_minutes,
          position: b.position,
        })),
      });
    }).catch(() => sileo.error({ title: 'Error al cargar turno' }))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: ShiftFormData) => {
    try {
      const payload = { ...data };
      if (payload.breaks) {
        payload.breaks = payload.breaks.map((b, i) => ({ ...b, position: i }));
      }
      await shifts.update(Number(id), payload);
      sileo.success({ title: 'Turno actualizado' });
      navigate('/shifts');
    } catch {
      sileo.error({ title: 'Error al actualizar turno' });
    }
  };

  if (loading) return <SkeletonForm fields={8} />;
  if (!shift) return <p className="text-gray-400">Turno no encontrado.</p>;

  return (
    <div>
      <Link to="/shifts" className="text-sm text-radar hover:underline">← Turnos</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Editar: {shift.name}</h2>
        <TutorialModal steps={shiftFormSteps} />
      </div>

      <div className="mt-6 max-w-2xl rounded-xl bg-grafito p-6 shadow-sm">
        <ShiftForm
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="Guardar"
          submittingLabel="Guardando..."
        />
      </div>
    </div>
  );
}

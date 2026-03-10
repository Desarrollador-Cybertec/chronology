import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { shifts } from '@/api/endpoints';
import { shiftSchema, type ShiftFormData } from '@/schemas/shifts';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftFormSteps } from '@/data/pageTutorials';
import ShiftForm from './ShiftForm';

export default function ShiftFormPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema) as Resolver<ShiftFormData>,
    defaultValues: {
      crosses_midnight: false,
      tolerance_minutes: 5,
      overtime_enabled: true,
      overtime_min_block_minutes: 30,
      max_daily_overtime_minutes: 120,
      is_active: true,
      breaks: [],
    },
  });

  const onSubmit = async (data: ShiftFormData) => {
    try {
      const payload = { ...data };
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
        <ShiftForm
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="Crear turno"
          submittingLabel="Creando..."
        />
      </div>
    </div>
  );
}

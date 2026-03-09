import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sileo } from 'sileo';
import { employees } from '@/api/endpoints';
import { employeeUpdateSchema, type EmployeeUpdateFormData } from '@/schemas/employees';
import type { Employee } from '@/types/api';
import { SkeletonForm } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { employeeEditSteps } from '@/data/pageTutorials';

const inputBase = 'w-full rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeUpdateFormData>({
    resolver: zodResolver(employeeUpdateSchema),
  });

  useEffect(() => {
    if (!id) return;
    employees.get(Number(id)).then((res) => {
      setEmployee(res.data);
      reset({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        department: res.data.department ?? '',
        position: res.data.position ?? '',
      });
    }).catch(() => sileo.error({ title: 'Error al cargar empleado' }))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: EmployeeUpdateFormData) => {
    try {
      await employees.update(Number(id), data);
      sileo.success({ title: 'Empleado actualizado' });
      navigate(`/employees/${id}`);
    } catch {
      sileo.error({ title: 'Error al actualizar' });
    }
  };

  if (loading) return <SkeletonForm fields={4} />;
  if (!employee) return <p className="text-gray-400">Empleado no encontrado.</p>;

  return (
    <div>
      <Link to={`/employees/${id}`} className="text-sm text-radar hover:underline">← Volver</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Editar empleado</h2>
        <TutorialModal steps={employeeEditSteps} />
      </div>

      <div className="mt-6 max-w-2xl rounded-xl bg-grafito p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-300">Nombre</label>
            <input id="first_name" {...register('first_name')} className={`${inputBase} ${errors.first_name ? 'border-red-400' : ''}`} />
            {errors.first_name && <span className="mt-1 block text-xs text-red-500">{errors.first_name.message}</span>}
          </div>

          <div>
            <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-300">Apellido</label>
            <input id="last_name" {...register('last_name')} className={`${inputBase} ${errors.last_name ? 'border-red-400' : ''}`} />
            {errors.last_name && <span className="mt-1 block text-xs text-red-500">{errors.last_name.message}</span>}
          </div>

          <div>
            <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-300">Departamento</label>
            <input id="department" {...register('department')} className={inputBase} />
          </div>

          <div>
            <label htmlFor="position" className="mb-1 block text-sm font-medium text-gray-300">Cargo</label>
            <input id="position" {...register('position')} className={inputBase} />
          </div>

          <div className="flex gap-3 pt-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to={`/employees/${id}`} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-grafito-lighter">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

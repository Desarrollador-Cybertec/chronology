import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { sileo } from 'sileo';
import { registerSchema, type RegisterFormData } from '@/schemas/auth';
import { auth } from '@/api/endpoints';
import { ApiError } from '@/api/client';

const inputBase = 'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500';

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await auth.register(data);
      sileo.success({ title: 'Cuenta creada', description: 'Ahora puedes iniciar sesión.' });
      navigate('/login');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: Record<string, string[]> };
        if (body.errors) {
          Object.entries(body.errors).forEach(([field, msgs]) => {
            setError(field as keyof RegisterFormData, { message: msgs[0] });
          });
        }
      } else {
        sileo.error({ title: 'Error al registrarse' });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">Chronology</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Crear cuenta nueva</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input id="name" type="text" autoComplete="name" {...register('name')} className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
            <input id="password" type="password" autoComplete="new-password" {...register('password')} className={`${inputBase} ${errors.password ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.password && <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input id="password_confirmation" type="password" autoComplete="new-password" {...register('password_confirmation')} className={`${inputBase} ${errors.password_confirmation ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.password_confirmation && <span className="mt-1 block text-xs text-red-500">{errors.password_confirmation.message}</span>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

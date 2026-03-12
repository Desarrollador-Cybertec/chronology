import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { sileo } from 'sileo';
import { useAuth } from '@/context/useAuth';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { ApiError } from '@/api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      sileo.success({ title: '¡Bienvenido!' });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        sileo.error({ title: 'Credenciales inválidas' });
      } else if (err instanceof ApiError && err.status === 409) {
        sileo.error({ title: 'Sesión activa', description: (err.body as { message?: string }).message ?? 'Este usuario ya tiene una sesión activa.' });
      } else {
        sileo.error({ title: 'Error al iniciar sesión' });
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy">
      <div className="pointer-events-none fixed inset-0 bg-[url('/web.svg')] bg-cover bg-center bg-no-repeat" />
      <div className="relative w-full max-w-md rounded-xl bg-grafito p-8 shadow-lg">
        <div className="flex justify-center">
          <img src="/chronology-login.png" alt="Chronology" className="h-50" />
        </div>
        <p className="mt-3 text-center text-sm text-gray-400">Inicia sesión en tu cuenta</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full rounded-lg border bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar ${
                errors.email ? 'border-red-400' : 'border-white/10'
              }`}
            />
            {errors.email && <span className="mt-1 block text-xs text-red-400">{errors.email.message}</span>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={`w-full rounded-lg border bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar ${
                errors.password ? 'border-red-400' : 'border-white/10'
              }`}
            />
            {errors.password && <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-radar py-2.5 text-sm font-semibold text-white transition hover:bg-radar-light disabled:opacity-50 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          ¿No tienes cuenta? <Link to="/register" className="font-medium text-radar hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

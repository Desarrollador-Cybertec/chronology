import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/useAuth';

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      Cargando...
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function SuperadminRoute() {
  const { user, loading, isSuperadmin } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperadmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

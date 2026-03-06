import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { Skeleton } from '@/components/ui/Skeleton';

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-3 w-48">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
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

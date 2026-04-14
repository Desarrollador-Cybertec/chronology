import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster, sileo } from 'sileo';
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute, SuperadminRoute, GuestRoute } from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import SubscriptionBlockedModal from '@/components/ui/SubscriptionBlockedModal';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { onSubscriptionUnavailable } from '@/utils/subscriptionEvents';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const EmployeeListPage = lazy(() => import('@/pages/employees/EmployeeListPage'));
const EmployeeDetailPage = lazy(() => import('@/pages/employees/EmployeeDetailPage'));
const EmployeeEditPage = lazy(() => import('@/pages/employees/EmployeeEditPage'));
const AssignShiftPage = lazy(() => import('@/pages/employees/AssignShiftPage'));
const ShiftAssignmentEditPage = lazy(() => import('@/pages/employees/ShiftAssignmentEditPage'));
const ShiftListPage = lazy(() => import('@/pages/shifts/ShiftListPage'));
const ShiftAssignmentPage = lazy(() => import('@/pages/shifts/ShiftAssignmentPage'));
const ShiftFormPage = lazy(() => import('@/pages/shifts/ShiftFormPage'));
const ShiftEditPage = lazy(() => import('@/pages/shifts/ShiftEditPage'));
const AttendanceListPage = lazy(() => import('@/pages/attendance/AttendanceListPage'));
const AttendanceDetailPage = lazy(() => import('@/pages/attendance/AttendanceDetailPage'));
const AttendanceEditPage = lazy(() => import('@/pages/attendance/AttendanceEditPage'));
const ImportPage = lazy(() => import('@/pages/import/ImportPage'));
const ImportDetailPage = lazy(() => import('@/pages/import/ImportDetailPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const ReportDetailPage = lazy(() => import('@/pages/reports/ReportDetailPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

function PageFallback() {
  return (
    <div className="p-6">
      <SkeletonDetail />
    </div>
  );
}

function App() {
  useEffect(() => {
    return onSubscriptionUnavailable((message) => {
      sileo.warning({
        title: 'Sistema no disponible',
        description: message,
      });
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" options={{ fill: '#202020', roundness: 12 }} />
        <SubscriptionBlockedModal />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Guest routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />

                {/* Employees */}
                <Route path="/employees" element={<EmployeeListPage />} />
                <Route path="/employees/:id" element={<EmployeeDetailPage />} />

                {/* Shifts */}
                <Route path="/shifts" element={<ShiftListPage />} />
                <Route path="/shifts/assign" element={<ShiftAssignmentPage />} />

                {/* Attendance */}
                <Route path="/attendance" element={<AttendanceListPage />} />
                <Route path="/attendance/:id" element={<AttendanceDetailPage />} />

                {/* Import */}
                <Route path="/import" element={<ImportPage />} />
                <Route path="/import/:id" element={<ImportDetailPage />} />

                {/* Reports */}
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />

                {/* Superadmin routes */}
                <Route element={<SuperadminRoute />}>
                  <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
                  <Route path="/employees/:employeeId/assign-shift" element={<AssignShiftPage />} />
                  <Route path="/employees/:employeeId/shifts/:assignmentId/edit" element={<ShiftAssignmentEditPage />} />
                  <Route path="/shifts/create" element={<ShiftFormPage />} />
                  <Route path="/shifts/:id/edit" element={<ShiftEditPage />} />
                  <Route path="/attendance/:id/edit" element={<AttendanceEditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

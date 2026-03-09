import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sileo';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute, SuperadminRoute, GuestRoute } from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EmployeeListPage from '@/pages/employees/EmployeeListPage';
import EmployeeDetailPage from '@/pages/employees/EmployeeDetailPage';
import EmployeeEditPage from '@/pages/employees/EmployeeEditPage';
import AssignShiftPage from '@/pages/employees/AssignShiftPage';
import ShiftListPage from '@/pages/shifts/ShiftListPage';
import ShiftAssignmentPage from '@/pages/shifts/ShiftAssignmentPage';
import ShiftFormPage from '@/pages/shifts/ShiftFormPage';
import ShiftEditPage from '@/pages/shifts/ShiftEditPage';
import AttendanceListPage from '@/pages/attendance/AttendanceListPage';
import AttendanceDetailPage from '@/pages/attendance/AttendanceDetailPage';
import AttendanceEditPage from '@/pages/attendance/AttendanceEditPage';
import ImportPage from '@/pages/import/ImportPage';
import ImportDetailPage from '@/pages/import/ImportDetailPage';
import SettingsPage from '@/pages/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" options={{ fill: '#202020', roundness: 12 }} />
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

              {/* Superadmin routes */}
              <Route element={<SuperadminRoute />}>
                <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
                <Route path="/employees/:employeeId/assign-shift" element={<AssignShiftPage />} />
                <Route path="/shifts/create" element={<ShiftFormPage />} />
                <Route path="/shifts/:id/edit" element={<ShiftEditPage />} />
                <Route path="/attendance/:id/edit" element={<AttendanceEditPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

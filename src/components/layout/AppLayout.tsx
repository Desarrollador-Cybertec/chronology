import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowUpTray,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserGroup,
  HiOutlineDocumentChartBar,
} from 'react-icons/hi2';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HiOutlineHome, end: true },
  { to: '/import', label: 'Importar CSV', icon: HiOutlineArrowUpTray },
  { to: '/attendance', label: 'Asistencia', icon: HiOutlineClipboardDocumentCheck },
  { to: '/shifts/assign', label: 'Asignar turnos', icon: HiOutlineUserGroup },
  { to: '/reports', label: 'Reportes', icon: HiOutlineDocumentChartBar },
  { to: '/shifts', label: 'Turnos', icon: HiOutlineClock, end: true },
  { to: '/employees', label: 'Empleados', icon: HiOutlineUsers },
];

export default function AppLayout() {
  const { user, logout, isSuperadmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    sileo.success({ title: 'Sesión cerrada' });
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${
      isActive
        ? 'border-radar bg-radar/10 text-radar'
        : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-grafito text-gray-300">
        <div className="border-b border-white/8 px-4 py-5">
          <img src="/logonav.svg" alt="Chronology" className="w-full" />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
          {isSuperadmin && (
            <NavLink to="/settings" className={linkClass}>
              <HiOutlineCog6Tooth className="h-5 w-5 shrink-0" />
              Configuración
            </NavLink>
          )}
        </nav>

        <div className="border-t border-white/8 px-5 py-4">
          <div className="mb-2">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs capitalize text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 bg-navy p-8 relative">
        <div className="pointer-events-none fixed inset-0 ml-60 bg-[url('/web.svg')] bg-cover bg-center bg-no-repeat" />
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

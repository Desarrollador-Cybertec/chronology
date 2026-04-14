import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
} from 'react-icons/hi2';
import StatusBadge from '@/components/ui/StatusBadge';
import type { ImportBatch } from '@/types/api';

interface Props {
  totalEmployees: number;
  reincidentes: number;
  totalLateRecords: number;
  recentImport: ImportBatch | null;
  weekLoading: boolean;
}

export default function DashboardKPIs({
  totalEmployees,
  reincidentes,
  totalLateRecords,
  recentImport,
  weekLoading,
}: Props) {
  return (
    <div className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-200 ${weekLoading ? 'opacity-50' : ''}`}>
      <KPI icon={<HiOutlineUsers className="h-6 w-6" />} iconBg="bg-radar/10 text-radar" value={totalEmployees} label="Empleados" />
      <KPI icon={<HiOutlineExclamationTriangle className="h-6 w-6" />} iconBg="bg-red-50 text-red-600" value={reincidentes} label="Reincidentes" valueClass="text-red-600" />
      <KPI icon={<HiOutlineClock className="h-6 w-6" />} iconBg="bg-amber-50 text-amber-600" value={totalLateRecords} label="Total tardanzas" />
      <KPI
        icon={<HiOutlineArrowUpTray className="h-6 w-6" />}
        iconBg="bg-amber-50 text-amber-600"
        value={recentImport ? <StatusBadge status={recentImport.status} /> : '—'}
        label="Última importación"
      />
    </div>
  );
}

function KPI({
  icon,
  iconBg,
  value,
  label,
  valueClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: React.ReactNode;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <span className={`block text-2xl font-bold ${valueClass ?? 'text-white'}`}>{value}</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
}

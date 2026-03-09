import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { shifts } from '@/api/endpoints';
import type { Shift, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';
import { useTableSort } from '@/hooks/useTableSort';
import SortableHeader from '@/components/ui/SortableHeader';
import {
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';
import { SkeletonTable } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { shiftListSteps, shiftListAdminSteps } from '@/data/pageTutorials';

export default function ShiftListPage() {
  const { isSuperadmin } = useAuth();
  const [data, setData] = useState<Shift[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const shiftAccessors = useMemo(() => ({
    name: (s: Shift) => s.name,
    start_time: (s: Shift) => s.start_time,
    tolerance_minutes: (s: Shift) => s.tolerance_minutes,
    breaks: (s: Shift) => s.breaks?.length ?? 0,
    overtime_enabled: (s: Shift) => (s.overtime_enabled ? 0 : 1),
    is_active: (s: Shift) => (s.is_active ? 0 : 1),
  }), []);
  const { sortKey, sortDir, toggle, sorted } = useTableSort(data, shiftAccessors);

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  useEffect(() => {
    shifts.list(page).then((res) => {
      setData(res.data);
      setMeta(res.meta);
    }).catch(() => sileo.error({ title: 'Error al cargar turnos' }))
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar turno "${name}"?`)) return;
    try {
      await shifts.delete(id);
      sileo.success({ title: 'Turno eliminado' });
      setData((prev) => prev.filter((s) => s.id !== id));
    } catch {
      sileo.error({ title: 'Error al eliminar turno' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineClock className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Turnos</h2>
        </div>
        <div className="flex items-center gap-2">
          <TutorialModal steps={isSuperadmin ? shiftListAdminSteps : shiftListSteps} />
          {isSuperadmin && (
            <Link to="/shifts/create" className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark">
              <HiOutlinePlusCircle className="h-4 w-4" /> Nuevo turno
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonTable cols={7} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="Nombre" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Horario" column="start_time" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Tolerancia" column="tolerance_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Descansos" column="breaks" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="HE" column="overtime_enabled" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Estado" column="is_active" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((shift) => (
                  <tr key={shift.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3 font-medium">{shift.name}</td>
                    <td className="px-4 py-3">
                      {shift.start_time} - {shift.end_time}
                      {shift.crosses_midnight && <span className="ml-1 text-gray-400">(nocturno)</span>}
                    </td>
                    <td className="px-4 py-3">{shift.tolerance_minutes} min</td>
                    <td className="px-4 py-3">
                      {shift.breaks && shift.breaks.length > 0
                        ? `${shift.breaks.length} bloque${shift.breaks.length > 1 ? 's' : ''} (${shift.breaks.reduce((sum, b) => sum + b.duration_minutes, 0)} min)`
                        : 'No'}
                    </td>
                    <td className="px-4 py-3">{shift.overtime_enabled ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${shift.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {shift.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {isSuperadmin && (
                          <>
                            <Link to={`/shifts/${shift.id}/edit`} className="flex items-center gap-1 text-sm text-radar hover:underline"><HiOutlinePencilSquare className="h-4 w-4" /> Editar</Link>
                            <button className="flex items-center gap-1 text-sm text-red-600 hover:underline cursor-pointer" onClick={() => handleDelete(shift.id, shift.name)}><HiOutlineTrash className="h-4 w-4" /> Eliminar</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No hay turnos configurados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}

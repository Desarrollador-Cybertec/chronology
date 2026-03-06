import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { shifts } from '@/api/endpoints';
import type { Shift, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/useAuth';
import { sileo } from 'sileo';

export default function ShiftListPage() {
  const { isSuperadmin } = useAuth();
  const [data, setData] = useState<Shift[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-2xl font-bold text-gray-900">Turnos</h2>
        {isSuperadmin && (
          <Link to="/shifts/create" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">+ Nuevo turno</Link>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Horario</th>
                  <th className="px-4 py-3">Tolerancia</th>
                  <th className="px-4 py-3">Almuerzo</th>
                  <th className="px-4 py-3">HE</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{shift.name}</td>
                    <td className="px-4 py-3">
                      {shift.start_time} - {shift.end_time}
                      {shift.crosses_midnight && <span className="ml-1 text-gray-400">(nocturno)</span>}
                    </td>
                    <td className="px-4 py-3">{shift.tolerance_minutes} min</td>
                    <td className="px-4 py-3">{shift.lunch_required ? `${shift.lunch_duration_minutes} min` : 'No'}</td>
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
                            <Link to={`/shifts/${shift.id}/edit`} className="text-sm text-indigo-600 hover:underline">Editar</Link>
                            <button className="text-sm text-red-600 hover:underline cursor-pointer" onClick={() => handleDelete(shift.id, shift.name)}>Eliminar</button>
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

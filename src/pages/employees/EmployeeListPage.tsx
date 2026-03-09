import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { employees } from "@/api/endpoints";
import type { Employee, PaginationMeta } from "@/types/api";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/context/useAuth";
import { sileo } from "sileo";
import { ApiError } from "@/api/client";
import SortableHeader from "@/components/ui/SortableHeader";
import {
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlinePower,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { SkeletonTable } from "@/components/ui/Skeleton";
import TutorialModal from "@/components/ui/TutorialModal";
import { employeeListSteps, employeeListAdminSteps } from "@/data/pageTutorials";

export default function EmployeeListPage() {
  const { isSuperadmin } = useAuth();
  const [data, setData] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [sortKey, setSortKey] = useState<string>('last_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggle = useCallback((column: string) => {
    setSortDir(prev => sortKey === column ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(column);
    setLoading(true);
    _setPage(1);
  }, [sortKey]);

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setSearchDebounced(search);
      _setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    employees
      .list(page, searchDebounced || undefined, sortKey, sortDir)
      .then((res) => {
        setData(res.data);
        setMeta(res.meta);
      })
      .catch(() => {
        sileo.error({ title: "Error al cargar empleados" });
      })
      .finally(() => setLoading(false));
  }, [page, searchDebounced, sortKey, sortDir]);

  const handleToggle = async (id: number) => {
    try {
      const res = await employees.toggleActive(id);
      sileo.success({ title: res.message });
      setData((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_active: res.is_active } : e)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        sileo.error({ title: "Error al cambiar estado" });
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineUsers className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Empleados</h2>
        </div>
        <TutorialModal steps={isSuperadmin ? employeeListAdminSteps : employeeListSteps} />
      </div>

      <div className="mt-4">
        <div className="relative max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-grafito-light py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-radar"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable cols={6} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-gray-400">
                <tr>
                  <SortableHeader label="ID Interno" column="internal_id" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Nombre" column="last_name" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <SortableHeader label="Departamento" column="department" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <th className="px-4 py-3">Cargo</th>
                  <SortableHeader label="Estado" column="is_active" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((emp) => (
                  <tr key={emp.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3">{emp.internal_id}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-medium text-radar hover:underline"
                      >
                        {emp.first_name} {emp.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{emp.department ?? "—"}</td>
                    <td className="px-4 py-3">{emp.position ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {emp.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="flex items-center gap-1 text-sm text-radar hover:underline"
                        >
                          <HiOutlineEye className="h-4 w-4" /> Ver
                        </Link>
                        {isSuperadmin && (
                          <>
                            <Link
                              to={`/employees/${emp.id}/edit`}
                              className="flex items-center gap-1 text-sm text-radar hover:underline"
                            >
                              <HiOutlinePencilSquare className="h-4 w-4" /> Editar
                            </Link>
                            <button
                              className="flex items-center gap-1 text-sm text-radar hover:underline cursor-pointer"
                              onClick={() => handleToggle(emp.id)}
                            >
                              <HiOutlinePower className="h-4 w-4" />
                              {emp.is_active ? "Desactivar" : "Activar"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      No hay empleados registrados.
                    </td>
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

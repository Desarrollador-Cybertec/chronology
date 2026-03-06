import { useEffect, useState } from "react";
import { Link } from "react-router";
import { employees } from "@/api/endpoints";
import type { Employee, PaginationMeta } from "@/types/api";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/context/useAuth";
import { sileo } from "sileo";
import { ApiError } from "@/api/client";
import {
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlinePower,
} from "react-icons/hi2";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function EmployeeListPage() {
  const { isSuperadmin } = useAuth();
  const [data, setData] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, _setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const setPage = (p: number) => { setLoading(true); _setPage(p); };

  useEffect(() => {
    employees
      .list(page)
      .then((res) => {
        setData(res.data);
        setMeta(res.meta);
      })
      .catch(() => {
        sileo.error({ title: "Error al cargar empleados" });
      })
      .finally(() => setLoading(false));
  }, [page]);

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
      <div className="flex items-center gap-2">
        <HiOutlineUsers className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Empleados</h2>
      </div>

      {loading ? (
        <SkeletonTable cols={6} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID Interno</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{emp.internal_id}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-medium text-indigo-600 hover:underline"
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
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                        >
                          <HiOutlineEye className="h-4 w-4" /> Ver
                        </Link>
                        {isSuperadmin && (
                          <>
                            <Link
                              to={`/employees/${emp.id}/edit`}
                              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                            >
                              <HiOutlinePencilSquare className="h-4 w-4" /> Editar
                            </Link>
                            <button
                              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline cursor-pointer"
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

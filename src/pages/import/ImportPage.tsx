import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router';
import { sileo } from 'sileo';
import { imports } from '@/api/endpoints';
import type { ImportBatch, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/useAuth';
import { ApiError } from '@/api/client';

export default function ImportPage() {
  const { isSuperadmin } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    setLoading(true);
    imports.list(page)
      .then((res) => {
        setBatches(res.data);
        setMeta(res.meta);
      })
      .catch(() => sileo.error({ title: 'Error al cargar importaciones' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      sileo.warning({ title: 'Selecciona un archivo CSV' });
      return;
    }
    setUploading(true);
    try {
      const res = await imports.upload(file);
      sileo.success({
        title: 'Archivo subido',
        description: `${res.data.total_rows} filas detectadas. Procesando...`,
      });
      if (fileRef.current) fileRef.current.value = '';
      fetchBatches();
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: string[] };
        sileo.error({ title: 'Error de validación', description: body.errors?.[0] });
      } else {
        sileo.error({ title: 'Error al subir archivo' });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (id: number) => {
    if (!confirm('¿Reprocesar este batch? Los registros de asistencia (no editados manualmente) serán eliminados y recalculados.')) return;
    try {
      const res = await imports.reprocess(id);
      sileo.success({ title: res.message });
      fetchBatches();
    } catch {
      sileo.error({ title: 'Error al reprocesar' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Importar CSV</h2>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Subir archivo del biométrico</h3>
        <p className="mt-1 text-sm text-gray-500">
          Archivo CSV con columnas: ID de persona, Hora. Máximo 10 MB.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600 file:cursor-pointer"
          />
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir CSV'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Historial de importaciones</h3>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Archivo</th>
                    <th className="px-4 py-3">Filas</th>
                    <th className="px-4 py-3">Procesadas</th>
                    <th className="px-4 py-3">Fallidas</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{b.id}</td>
                      <td className="px-4 py-3">{b.original_filename}</td>
                      <td className="px-4 py-3">{b.total_rows}</td>
                      <td className="px-4 py-3">{b.processed_rows}</td>
                      <td className={`px-4 py-3 ${b.failed_rows > 0 ? 'text-red-600 font-medium' : ''}`}>{b.failed_rows}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="flex gap-2 px-4 py-3">
                        <Link to={`/import/${b.id}`} className="text-sm text-indigo-600 hover:underline">Ver</Link>
                        {isSuperadmin && b.status === 'completed' && (
                          <button className="text-sm text-indigo-600 hover:underline cursor-pointer" onClick={() => handleReprocess(b.id)}>
                            Reprocesar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">No hay importaciones.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}

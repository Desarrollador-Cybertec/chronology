import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { sileo } from 'sileo';
import { imports } from '@/api/endpoints';
import type { ImportBatch, PaginationMeta } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import FileDropZone from '@/components/ui/FileDropZone';
import ProcessingIndicator from '@/components/ui/ProcessingIndicator';
import { useAuth } from '@/context/useAuth';
import { ApiError } from '@/api/client';
import {
  HiOutlineArrowUpTray,
  HiOutlineArrowPath,
  HiOutlineEye,
} from 'react-icons/hi2';
import { SkeletonTable } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { importPageSteps, importPageAdminSteps } from '@/data/pageTutorials';
import { useTableSort } from '@/hooks/useTableSort';
import SortableHeader from '@/components/ui/SortableHeader';

export default function ImportPage() {
  const { isSuperadmin } = useAuth();
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [processingBatch, setProcessingBatch] = useState<ImportBatch | null>(null);
  const [loading, setLoading] = useState(true);

  const impAccessors = useMemo(() => ({
    id: (b: ImportBatch) => b.id,
    original_filename: (b: ImportBatch) => b.original_filename,
    total_rows: (b: ImportBatch) => b.total_rows,
    processed_rows: (b: ImportBatch) => b.processed_rows,
    failed_rows: (b: ImportBatch) => b.failed_rows,
    status: (b: ImportBatch) => b.status,
  }), []);
  const { sortKey, sortDir, toggle, sorted } = useTableSort(batches, impAccessors);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await imports.upload(file);
      sileo.success({
        title: 'Archivo subido',
        description: `${res.data.total_rows} filas detectadas. Procesando...`,
      });
      setProcessingBatch(res.data);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineArrowUpTray className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Importar CSV</h2>
        </div>
        <TutorialModal steps={isSuperadmin ? importPageAdminSteps : importPageSteps} />
      </div>

      <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white">Subir archivo del biométrico</h3>
        <p className="mt-1 mb-4 text-sm text-gray-400">
          Archivo CSV con columnas: ID de persona, Hora. Máximo 10 MB.
        </p>
        <FileDropZone onFileSelected={handleUpload} disabled={uploading} />
        {uploading && <p className="mt-3 text-center text-sm text-radar animate-pulse">Subiendo archivo...</p>}
        {processingBatch && (
          <div className="mt-4">
            <ProcessingIndicator
              batch={processingBatch}
              onComplete={() => { setProcessingBatch(null); fetchBatches(); }}
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white">Historial de importaciones</h3>

        {loading ? (
          <SkeletonTable cols={7} rows={4} />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-xl bg-grafito shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
                    <SortableHeader label="#" column="id" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <SortableHeader label="Archivo" column="original_filename" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <SortableHeader label="Filas" column="total_rows" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <SortableHeader label="Procesadas" column="processed_rows" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <SortableHeader label="Fallidas" column="failed_rows" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <SortableHeader label="Estado" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sorted.map((b) => (
                    <tr key={b.id} className="hover:bg-grafito-lighter">
                      <td className="px-4 py-3">{b.id}</td>
                      <td className="px-4 py-3">{b.original_filename}</td>
                      <td className="px-4 py-3">{b.total_rows}</td>
                      <td className="px-4 py-3">{b.processed_rows}</td>
                      <td className={`px-4 py-3 ${b.failed_rows > 0 ? 'text-red-600 font-medium' : ''}`}>{b.failed_rows}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="flex gap-2 px-4 py-3">
                        <Link to={`/import/${b.id}`} className="flex items-center gap-1 text-sm text-radar hover:underline"><HiOutlineEye className="h-4 w-4" /> Ver</Link>
                        {isSuperadmin && b.status === 'completed' && (
                          <button className="flex items-center gap-1 text-sm text-radar hover:underline cursor-pointer" onClick={() => handleReprocess(b.id)}>
                            <HiOutlineArrowPath className="h-4 w-4" /> Reprocesar
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

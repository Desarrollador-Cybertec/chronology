import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { imports } from '@/api/endpoints';
import type { ImportBatch } from '@/types/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { sileo } from 'sileo';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import TutorialModal from '@/components/ui/TutorialModal';
import { importDetailSteps } from '@/data/pageTutorials';

export default function ImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    imports.get(Number(id))
      .then((res) => setBatch(res.data))
      .catch(() => sileo.error({ title: 'Error al cargar importación' }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail rows={6} />;
  if (!batch) return <p className="text-gray-400">Importación no encontrada.</p>;

  return (
    <div>
      <Link to="/import" className="text-sm text-radar hover:underline">← Importaciones</Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Importación #{batch.id}</h2>
        <TutorialModal steps={importDetailSteps} />
      </div>

      <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            ['Archivo', batch.original_filename],
            ['Total filas', batch.total_rows],
            ['Procesadas', batch.processed_rows],
            ['Procesado', batch.processed_at ? new Date(batch.processed_at).toLocaleString() : 'Pendiente'],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-sm text-gray-400">{label}</dt>
              <dd className="text-sm font-medium text-white">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between border-b border-white/5 pb-2">
            <dt className="text-sm text-gray-400">Estado</dt>
            <dd><StatusBadge status={batch.status} /></dd>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <dt className="text-sm text-gray-400">Fallidas</dt>
            <dd className={`text-sm font-medium ${batch.failed_rows > 0 ? 'text-red-600' : 'text-white'}`}>{batch.failed_rows}</dd>
          </div>
        </dl>

        {batch.errors && batch.errors.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white">Errores</h4>
            <ul className="mt-2 space-y-1">
              {batch.errors.map((e) => (
                <li key={e} className="text-sm text-red-600">• {e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

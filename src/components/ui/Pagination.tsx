import type { PaginationMeta } from '@/types/api';

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const base = 'inline-flex h-8 min-w-8 items-center justify-center rounded border text-sm transition-colors cursor-pointer';
const normal = `${base} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`;
const active = `${base} border-indigo-500 bg-indigo-500 text-white`;

export default function Pagination({ meta, onPageChange }: Props) {
  if (meta.last_page <= 1) return null;

  const pages: number[] = [];
  const range = 2;
  for (let i = Math.max(1, meta.current_page - range); i <= Math.min(meta.last_page, meta.current_page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1">
      <button className={normal} disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)}>←</button>

      {pages[0] > 1 && (
        <>
          <button className={normal} onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} className={p === meta.current_page ? active : normal} onClick={() => onPageChange(p)}>{p}</button>
      ))}

      {pages[pages.length - 1] < meta.last_page && (
        <>
          {pages[pages.length - 1] < meta.last_page - 1 && <span className="px-1 text-gray-400">…</span>}
          <button className={normal} onClick={() => onPageChange(meta.last_page)}>{meta.last_page}</button>
        </>
      )}

      <button className={normal} disabled={meta.current_page === meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>→</button>

      <span className="ml-3 text-sm text-gray-500">{meta.total} resultados</span>
    </div>
  );
}

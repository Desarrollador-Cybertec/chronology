const STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: 'Presente', color: 'bg-emerald-100 text-emerald-700' },
  absent: { label: 'Ausente', color: 'bg-red-100 text-red-700' },
  incomplete: { label: 'Incompleto', color: 'bg-amber-100 text-amber-700' },
  rest: { label: 'Descanso', color: 'bg-gray-100 text-gray-600' },
  holiday: { label: 'Feriado', color: 'bg-sky-100 text-sky-700' },
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Procesando', color: 'bg-sky-100 text-sky-700' },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.color}`}>{info.label}</span>;
}

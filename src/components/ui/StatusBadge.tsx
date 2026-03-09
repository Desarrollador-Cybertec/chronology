const STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: 'Presente', color: 'bg-emerald-500/20 text-emerald-400' },
  absent: { label: 'Ausente', color: 'bg-red-500/20 text-red-400' },
  incomplete: { label: 'Incompleto', color: 'bg-amber-500/20 text-amber-400' },
  rest: { label: 'Descanso', color: 'bg-white/5 text-gray-400' },
  holiday: { label: 'Feriado', color: 'bg-sky-500/20 text-sky-400' },
  pending: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400' },
  processing: { label: 'Procesando', color: 'bg-sky-500/20 text-sky-400' },
  completed: { label: 'Completado', color: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: 'Fallido', color: 'bg-red-500/20 text-red-400' },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { label: status, color: 'bg-white/5 text-gray-400' };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.color}`}>{info.label}</span>;
}

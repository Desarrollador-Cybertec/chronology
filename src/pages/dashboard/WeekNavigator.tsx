import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { fmtDay, type Week } from '@/utils/dashboardDates';

interface Props {
  availableMonths: { value: string; label: string }[];
  selectedMonth: string;
  onSelectMonth: (value: string) => void;
  weeks: Week[];
  weekIndex: number;
  onSelectWeek: (index: number) => void;
  currentWeek: Week;
  weekLoading: boolean;
}

export default function WeekNavigator({
  availableMonths,
  selectedMonth,
  onSelectMonth,
  weeks,
  weekIndex,
  onSelectWeek,
  currentWeek,
  weekLoading,
}: Props) {
  return (
    <div className="mt-4 rounded-xl bg-grafito shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/8 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mes</span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="rounded-lg border border-white/10 bg-navy/60 px-3 py-1.5 text-sm font-semibold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-radar transition"
          >
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Semana</span>
          <button
            type="button"
            onClick={() => onSelectWeek(Math.max(0, weekIndex - 1))}
            disabled={weekIndex === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <HiOutlineChevronLeft className="h-4 w-4" />
          </button>
          {weeks.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectWeek(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                i === weekIndex
                  ? 'bg-radar text-white shadow-sm'
                  : 'border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="hidden sm:inline">Semana </span>{i + 1}
              <span className="ml-1 hidden md:inline text-[10px] font-normal opacity-70">({fmtDay(w.from)}–{fmtDay(w.to)})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSelectWeek(Math.min(weeks.length - 1, weekIndex + 1))}
            disabled={weekIndex === weeks.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <HiOutlineChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/3">
        <p className="text-sm text-gray-300">
          Mostrando datos del{' '}
          <span className="font-semibold text-white">
            {fmtDay(currentWeek.from)} al {fmtDay(currentWeek.to)}
          </span>
        </p>
        {weekLoading && (
          <span className="flex items-center gap-1.5 text-xs text-radar animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-radar inline-block" />
            Actualizando...
          </span>
        )}
      </div>
    </div>
  );
}

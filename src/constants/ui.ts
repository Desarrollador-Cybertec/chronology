export const INPUT_BASE =
  'w-full rounded-lg border border-white/10 bg-grafito-light px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-radar';

export const DEFAULT_PER_PAGE = 15;

export const DEBOUNCE_MS = 400;

export const DAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
] as const;

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export const BREAK_TYPES = [
  { value: 'morning_snack', label: 'Merienda mañana' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'afternoon_snack', label: 'Merienda tarde' },
  { value: 'other', label: 'Otro' },
] as const;

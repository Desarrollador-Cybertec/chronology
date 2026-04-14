export interface Week { from: Date; to: Date }

const MONTHS_FULL_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function getWeekPeriods(periodStart: Date, periodEnd: Date): Week[] {
  const weeks: Week[] = [];
  let cursor = new Date(periodStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(periodEnd);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const weekFrom = new Date(cursor);
    let weekTo = new Date(cursor);
    while (weekTo.getDay() !== 0 && weekTo < end) {
      weekTo.setDate(weekTo.getDate() + 1);
    }
    if (weekTo > end) weekTo = new Date(end);
    weeks.push({ from: weekFrom, to: new Date(weekTo) });
    cursor = new Date(weekTo);
    cursor.setDate(cursor.getDate() + 1);
  }
  return weeks;
}

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getAvailableMonths(start: Date, end: Date): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= endMonth) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value, label: `${MONTHS_FULL_ES[cursor.getMonth()]} ${cursor.getFullYear()}` });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export function getMonthWeeks(monthKey: string, dataStart: Date, dataEnd: Date): Week[] {
  const [year, month] = monthKey.split('-').map(Number);
  const from = new Date(Math.max(new Date(year, month - 1, 1).getTime(), dataStart.getTime()));
  const to = new Date(Math.min(new Date(year, month, 0).getTime(), dataEnd.getTime()));
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  return from <= to ? getWeekPeriods(from, to) : [];
}

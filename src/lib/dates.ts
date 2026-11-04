export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekDates(date: Date = new Date()): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return da.toISOString().slice(0, 10) === db.toISOString().slice(0, 10);
}

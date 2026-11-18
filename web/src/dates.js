/** "2026-11-10" (input type=date) → Date a las 00:00:00.000 hora local. */
export function startOfDay(yyyyMmDd) {
  if (!yyyyMmDd) return undefined;
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** "2026-11-10" → Date a las 23:59:59.999 hora local. */
export function endOfDay(yyyyMmDd) {
  if (!yyyyMmDd) return undefined;
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

/** Fecha de hoy en formato YYYY-MM-DD (hora local). */
export function todayInput() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const formatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export function formatDate(iso) {
  if (!iso) return 'Fecha desconocida';
  const date = new Date(iso);
  return isNaN(date) ? iso : formatter.format(date);
}

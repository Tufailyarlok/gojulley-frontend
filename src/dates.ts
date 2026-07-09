// Local-timezone yyyy-mm-dd helpers (avoid the UTC off-by-one from toISOString()).
export function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  return localISO(new Date(y, m - 1, d + n))
}
export const todayISO = () => localISO(new Date())

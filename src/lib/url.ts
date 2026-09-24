// Bygger interne lenker som respekterer `base` (f.eks. /Linjen/).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(sti = '/'): string {
  const ren = sti.startsWith('/') ? sti : `/${sti}`;
  return `${base}${ren}`;
}

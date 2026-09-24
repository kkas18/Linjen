// Eneste animasjonsmodul (kapittel 8). Eier all GSAP-/Lenis-oppsett og rydder opp ved navigasjon.
// Fase 0: kun skjelett. Animasjoner legges til fra fase 1.

type Opprydding = () => void;

const oppryddinger: Opprydding[] = [];

export function redusertBevegelse(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initMotion(): void {
  if (redusertBevegelse()) {
    document.documentElement.dataset.motion = 'av';
    return;
  }
  document.documentElement.dataset.motion = 'på';
}

export function registrerOpprydding(fn: Opprydding): void {
  oppryddinger.push(fn);
}

export function ryddOpp(): void {
  while (oppryddinger.length) oppryddinger.pop()?.();
}

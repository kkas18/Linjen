// Nettverkskartet (6.1): glidebryter, avspilling og hendelser for valgt år.
// Ingen GSAP: inntegningen er CSS-overganger på stroke-dashoffset.

interface EpokeInfo {
  ar: number;
  arTekst: string;
  tittel: string;
  ingress: string;
  href: string;
}

const STEG_MS = 120; // 1 år per 120 ms (6.1)

export function initNettverk(rot: HTMLElement): void {
  const glider = rot.querySelector<HTMLInputElement>('[data-nettverk-glider]');
  const arVisning = rot.querySelector<HTMLOutputElement>('[data-nettverk-ar]');
  const spill = rot.querySelector<HTMLButtonElement>('[data-nettverk-spill]');
  const status = rot.querySelector<HTMLElement>('[data-nettverk-status]');
  const segmenter = [...rot.querySelectorAll<SVGPathElement>('.nettverk__svg .seg')];
  const epoker: EpokeInfo[] = JSON.parse(
    rot.querySelector('[data-nettverk-epoker]')?.textContent ?? '[]',
  );
  const felt = {
    ar: rot.querySelector<HTMLElement>('[data-nettverk-epoke-ar]'),
    tittel: rot.querySelector<HTMLElement>('[data-nettverk-epoke-tittel]'),
    ingress: rot.querySelector<HTMLElement>('[data-nettverk-epoke-ingress]'),
    lenke: rot.querySelector<HTMLAnchorElement>('[data-nettverk-epoke-lenke]'),
  };
  if (!glider || !arVisning || !spill) return;

  const start = Number(rot.dataset.start);
  const slutt = Number(rot.dataset.slutt);
  let tidtaker: number | undefined;

  const iDrift = () => segmenter.filter((s) => s.dataset.tilstand === 'aktiv').length;

  // aria-live oppdateres bare når brukeren slipper glideren eller avspillingen stopper,
  // så skjermlesere ikke får ett varsel per år.
  function annonser(ar: number): void {
    if (status) status.textContent = `${ar}: ${iDrift()} strekninger i drift`;
  }

  function vis(ar: number): void {
    arVisning!.textContent = String(ar);
    for (const s of segmenter) {
      const apnet = Number(s.dataset.apnet);
      const nedlagt = s.dataset.nedlagt ? Number(s.dataset.nedlagt) : null;
      s.dataset.tilstand =
        ar < apnet ? 'skjult' : nedlagt !== null && ar >= nedlagt ? 'nedlagt' : 'aktiv';
    }
    // Hendelser: epoken som gjaldt i valgt år.
    const epoke = [...epoker].reverse().find((e) => e.ar <= ar);
    if (epoke) {
      if (felt.ar) felt.ar.textContent = epoke.arTekst;
      if (felt.tittel) felt.tittel.textContent = epoke.tittel;
      if (felt.ingress) felt.ingress.textContent = epoke.ingress;
      if (felt.lenke) felt.lenke.href = epoke.href;
    }
  }

  function stopp(): void {
    window.clearInterval(tidtaker);
    tidtaker = undefined;
    spill!.textContent = 'Spill av';
    spill!.setAttribute('aria-pressed', 'false');
    annonser(Number(glider!.value));
  }

  function spillAv(): void {
    if (Number(glider!.value) >= slutt) glider!.value = String(start);
    vis(Number(glider!.value));
    spill!.textContent = 'Pause';
    spill!.setAttribute('aria-pressed', 'true');
    tidtaker = window.setInterval(() => {
      const neste = Number(glider!.value) + 1;
      glider!.value = String(neste);
      vis(neste);
      if (neste >= slutt) stopp();
    }, STEG_MS);
  }

  glider.addEventListener('input', () => {
    if (tidtaker !== undefined) stopp();
    vis(Number(glider.value));
  });
  glider.addEventListener('change', () => annonser(Number(glider.value)));
  spill.addEventListener('click', () => (tidtaker === undefined ? spillAv() : stopp()));
  spill.setAttribute('aria-pressed', 'false');

  vis(Number(glider.value));
}

// Eneste animasjonsmodul (kapittel 8). Eier all GSAP-/Lenis-oppsett og rydder opp ved navigasjon.
// Varigheter og kurver leses fra tokens.css, så bevegelsen styres ett sted.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

type Opprydding = () => void;

const oppryddinger: Opprydding[] = [];

const DESKTOP = '(min-width: 48rem)';
const REDUSERT = '(prefers-reduced-motion: reduce)';

export function redusertBevegelse(): boolean {
  return window.matchMedia(REDUSERT).matches;
}

export function registrerOpprydding(fn: Opprydding): void {
  oppryddinger.push(fn);
}

export function ryddOpp(): void {
  while (oppryddinger.length) oppryddinger.pop()?.();
}

/* ---------- Tokens ---------- */

function token(navn: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(navn).trim();
}

/** Tid-token (f.eks. «420ms» eller «3s») i sekunder, slik GSAP vil ha det. */
function tid(navn: string): number {
  const verdi = token(navn);
  const tall = parseFloat(verdi);
  if (Number.isNaN(tall)) return 0;
  return verdi.endsWith('ms') ? tall / 1000 : tall;
}

/** Gjør en cubic-bezier-token om til en GSAP-kurve. */
function kurve(navn: string): string {
  const id = `linjen${navn}`;
  if (CustomEase.get(id)) return id;
  const tall = token(navn).match(/-?[\d.]+/g);
  if (!tall || tall.length !== 4) return 'power2.out';
  CustomEase.create(id, tall.join(','));
  return id;
}

interface Bevegelse {
  rask: number;
  normal: number;
  sakte: number;
  forskyvning: number;
  tunnellys: number;
  scrub: number;
  ut: string;
  innUt: string;
}

function lesBevegelse(): Bevegelse {
  return {
    rask: tid('--t-rask'),
    normal: tid('--t-normal'),
    sakte: tid('--t-sakte'),
    forskyvning: tid('--t-forskyvning'),
    tunnellys: tid('--t-tunnellys'),
    scrub: parseFloat(token('--scrub')) || 0.6,
    ut: kurve('--ease-out'),
    innUt: kurve('--ease-inout'),
  };
}

/* ---------- Myk scroll ---------- */

function startLenis(): Opprydding {
  const nav = document.querySelector<HTMLElement>('.nav');
  const lenis = new Lenis({
    autoRaf: false,
    anchors: { offset: -(nav?.offsetHeight ?? 0) },
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tikk = (tidspunkt: number) => lenis.raf(tidspunkt * 1000);
  gsap.ticker.add(tikk);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tikk);
    lenis.destroy();
  };
}

/* ---------- Hero (5.1) ---------- */

function heroIntro(b: Bevegelse): Opprydding | undefined {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const bilde = hero.querySelector<HTMLElement>('[data-hero-bilde]');
  const tittel = hero.querySelector<HTMLElement>('[data-hero-tittel]');
  const spor = hero.querySelector<SVGElement>('[data-hero-spor]');

  const animasjoner: gsap.core.Animation[] = [];
  let split: SplitText | undefined;
  let sporStartet = false;

  if (bilde) {
    animasjoner.push(
      gsap.fromTo(bilde, { scale: 1.06 }, { scale: 1, duration: b.sakte, ease: b.ut }),
    );
  }

  const tegnSpor = (forsinkelse: number) => {
    if (!spor || sporStartet) return;
    sporStartet = true;
    animasjoner.push(
      gsap.to(spor, {
        strokeDashoffset: 0,
        duration: b.sakte,
        ease: b.innUt,
        delay: forsinkelse,
      }),
    );
  };

  if (tittel) {
    // Masket linje-for-linje-avdekking; autoSplit deler på nytt ved resize og fontlasting.
    split = SplitText.create(tittel, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(tittel, { visibility: 'visible' });
        // Gi masken plass til underlengder (g, j, y) uten å endre linjeavstanden.
        gsap.set(self.masks, { paddingBottom: '0.14em', marginBottom: '-0.14em' });
        const tween = gsap.from(self.lines, {
          yPercent: 100,
          duration: b.sakte,
          stagger: b.forskyvning,
          ease: b.ut,
        });
        tegnSpor(b.sakte + (self.lines.length - 1) * b.forskyvning);
        return tween;
      },
    });
  } else {
    tegnSpor(b.sakte);
  }

  return () => {
    animasjoner.forEach((a) => a.kill());
    split?.revert();
  };
}

/* ---------- Stasjoner (5.2) ---------- */

function settSignal(stasjon: HTMLElement, tilstand: 'rod' | 'gronn'): void {
  const signal = stasjon.querySelector<HTMLElement>('[data-signal]');
  if (signal) signal.dataset.signal = tilstand;
}

/** Teller et element opp fra `fra` til `til` når det kommer inn i bildet. */
function tellOpp(
  el: HTMLElement,
  fra: number,
  til: number,
  b: Bevegelse,
  formater: (n: number) => string = String,
): void {
  const teller = { verdi: fra };
  el.textContent = formater(fra);
  gsap.to(teller, {
    verdi: til,
    duration: b.sakte,
    ease: b.ut,
    onUpdate: () => {
      el.textContent = formater(Math.round(teller.verdi));
    },
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  });
}

function stasjoner(b: Bevegelse, redusert: boolean): void {
  document.querySelectorAll<HTMLElement>('[data-stasjon]').forEach((stasjon) => {
    // Tilbakestill til ferdig tekst (viktig når matchMedia bytter modus underveis).
    const ar = stasjon.querySelector<HTMLElement>('[data-stasjon-ar]');
    if (ar) {
      ar.dataset.original ??= ar.textContent?.trim() ?? '';
      ar.textContent = ar.dataset.original;
    }
    const faktaverdier = stasjon.querySelectorAll<HTMLElement>('[data-fakta-verdi]');
    faktaverdier.forEach((el) => {
      el.dataset.original ??= el.textContent?.trim() ?? '';
      el.textContent = el.dataset.original;
    });

    if (redusert) {
      settSignal(stasjon, 'gronn');
      return;
    }

    // Signal: rødt til seksjonen er 40 % inne i viewport, deretter grønt.
    settSignal(stasjon, 'rod');
    ScrollTrigger.create({
      trigger: stasjon,
      start: 'top 60%',
      onEnter: () => settSignal(stasjon, 'gronn'),
      onLeaveBack: () => settSignal(stasjon, 'rod'),
    });

    const skilt = stasjon.querySelector<HTMLElement>('[data-stasjon-skilt]');
    if (skilt) {
      gsap.from(skilt, {
        x: -24,
        autoAlpha: 0,
        duration: b.normal,
        ease: b.ut,
        scrollTrigger: { trigger: skilt, start: 'top 85%', once: true },
      });
    }

    // Årstallet teller opp fra forrige epoke. Epoker uten tall («I dag») står urørt.
    const fra = parseInt(stasjon.dataset.fra ?? '', 10);
    const til = parseInt(stasjon.dataset.ar ?? '', 10);
    if (ar && Number.isFinite(fra) && Number.isFinite(til)) tellOpp(ar, fra, til, b);

    // Hovedbilde: perrongdør-wipe fra venstre, bildet skaleres 1.04 → 1 samtidig.
    const bilde = stasjon.querySelector<HTMLElement>('[data-stasjon-bilde]');
    const indre = stasjon.querySelector<HTMLElement>('[data-stasjon-bilde-indre]');
    if (bilde) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: bilde, start: 'top 80%', once: true },
      });
      tl.fromTo(
        bilde,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: b.sakte, ease: b.innUt },
        0,
      );
      if (indre) tl.fromTo(indre, { scale: 1.04 }, { scale: 1, duration: b.sakte, ease: b.ut }, 0);

      // «Tunnellys»: en smal lys stripe feier én gang over det første T-banebildet (5.4).
      const stripe = bilde.querySelector<HTMLElement>('[data-tunnellys]');
      if (stripe) {
        tl.fromTo(
          stripe,
          { xPercent: -100, autoAlpha: 1 },
          { xPercent: 340, duration: b.tunnellys, ease: b.innUt },
          b.sakte * 0.8,
        ).set(stripe, { autoAlpha: 0 });
      }
    }

    // Faktaruter: tall som starter med et siffer telles opp; tekst (f.eks. TODO) står urørt.
    faktaverdier.forEach((el) => {
      const treff = el.dataset.original?.match(/^(\d[\d\s]*)(.*)$/);
      if (!treff) return;
      const verdi = Number(treff[1].replace(/\s/g, ''));
      const rest = treff[2];
      tellOpp(el, 0, verdi, b, (n) => `${n.toLocaleString('nb-NO')}${rest}`);
    });
  });
}

/* ---------- Sporlinje og fremdrift (5.3) ---------- */

function sporlinjeDesktop(b: Bevegelse): void {
  const linje = document.querySelector<HTMLElement>('[data-linje]');
  const trikk = linje?.querySelector<SVGElement>('[data-linje-trikk]');
  const passert = linje?.querySelector<SVGElement>('[data-linje-passert]');
  if (!linje || !trikk || !passert) return;

  const maksY = () => linje.offsetHeight - trikk.getBoundingClientRect().height;

  gsap
    .timeline({
      scrollTrigger: {
        trigger: linje,
        start: 'top center',
        end: 'bottom center',
        scrub: b.scrub,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(trikk, { y: 0 }, { y: maksY, ease: 'none' }, 0)
    .fromTo(passert, { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0%' }, 0);
}

function fremdriftMobil(b: Bevegelse, redusert: boolean): Opprydding | undefined {
  const linje = document.querySelector<HTMLElement>('[data-linje]');
  const fyll = document.querySelector<HTMLElement>('[data-fremdrift]');
  const gjeldende = document.querySelector<HTMLElement>('[data-gjeldende]');
  const navn = gjeldende?.querySelector<HTMLElement>('[data-gjeldende-navn]');
  const ar = gjeldende?.querySelector<HTMLElement>('[data-gjeldende-ar]');
  if (!linje) return;

  if (fyll) {
    gsap.fromTo(
      fyll,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: linje,
          start: 'top top',
          end: 'bottom bottom',
          scrub: redusert ? true : b.scrub,
        },
      },
    );
  }

  if (!gjeldende || !navn || !ar) return;
  const stasjonsliste = [...document.querySelectorAll<HTMLElement>('[data-stasjon]')];

  let gjeldendeIndeks = -1;
  const vis = (i: number) => {
    gjeldendeIndeks = i;
    const stasjon = stasjonsliste[i];
    if (!stasjon) {
      gjeldende.dataset.synlig = 'false';
      return;
    }
    navn.textContent = stasjon.dataset.navn ?? '';
    ar.textContent = stasjon.dataset.arTekst ?? '';
    gjeldende.dataset.synlig = 'true';
  };

  // Skiltet «fester seg» når stasjonens eget skilt har passert under navigasjonen.
  const nav = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0;
  stasjonsliste.forEach((stasjon, i) => {
    ScrollTrigger.create({
      trigger: stasjon.querySelector<HTMLElement>('[data-stasjon-skilt-rad]') ?? stasjon,
      start: () => `top ${nav + 16}px`,
      onEnter: () => vis(i),
      onLeaveBack: () => vis(i - 1),
    });
  });

  // Skjul skiltet når linjen er passert (materiell og avslutning), vis det igjen på vei tilbake.
  ScrollTrigger.create({
    trigger: linje,
    start: 'top top',
    end: 'bottom top',
    onLeave: () => {
      gjeldende.dataset.synlig = 'false';
    },
    onEnterBack: () => vis(gjeldendeIndeks),
  });

  return () => {
    gjeldende.dataset.synlig = 'false';
  };
}

/* ---------- Tunnelovergang (5.4) ---------- */

type Tema = 'lys' | 'tunnel';

/** Fargene som scrubbes på linjeflaten, hentet fra tokens.css. */
function temafarger(tema: Tema): Record<string, string> {
  const lys = tema === 'lys';
  return {
    '--c-bakgrunn': token(lys ? '--c-perrong' : '--c-tunnel'),
    '--c-tekst': token(lys ? '--c-grafitt' : '--c-lys-tekst'),
    '--c-tekst-2': token(lys ? '--c-grafitt-2' : '--c-lys-tekst-2'),
    '--c-spor': token(lys ? '--c-skinne' : '--c-skinne-mork'),
    '--c-lenke': token(lys ? '--c-trikkebla' : '--c-lys-tekst'),
  };
}

/** Når temaet skifter mellom to stasjoner, scrubbes fargene over 60vh. */
function tunnelovergang(b: Bevegelse): void {
  const flate = document.querySelector<HTMLElement>('[data-linje-flate]');
  const liste = [...document.querySelectorAll<HTMLElement>('[data-stasjon]')];
  if (!flate || liste.length === 0) return;

  const tema = (el: HTMLElement): Tema => (el.dataset.tema === 'tunnel' ? 'tunnel' : 'lys');
  gsap.set(flate, temafarger(tema(liste[0])));

  liste.forEach((stasjon, i) => {
    const forrige = liste[i - 1];
    if (!forrige || tema(forrige) === tema(stasjon)) return;
    gsap.fromTo(flate, temafarger(tema(forrige)), {
      ...temafarger(tema(stasjon)),
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: stasjon,
        start: 'top bottom',
        end: 'top 40%', // 60vh scroll-distanse
        scrub: b.scrub,
      },
    });
  });
}

/* ---------- Materiell-stripe (5.5) ---------- */

/** Desktop: seksjonen pinnes og raden glir horisontalt i takt med scroll. */
function materiellPin(b: Bevegelse): Opprydding | undefined {
  const seksjon = document.querySelector<HTMLElement>('[data-materiell]');
  const rad = seksjon?.querySelector<HTMLElement>('[data-materiell-rad]');
  if (!seksjon || !rad) return;

  seksjon.dataset.pinnet = 'true';
  const avstand = () => Math.max(0, rad.scrollWidth - document.documentElement.clientWidth);
  const nav = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0;

  gsap.to(rad, {
    x: () => -avstand(),
    ease: 'none',
    scrollTrigger: {
      trigger: seksjon,
      start: () => `top top+=${nav}`,
      end: () => `+=${avstand()}`,
      pin: true,
      scrub: b.scrub,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    delete seksjon.dataset.pinnet;
  };
}

/* ---------- Oppstart ---------- */

export function initMotion(): void {
  const rot = document.documentElement;
  // Hvis reserveløsningen i <head> allerede har slått av bevegelse, respekteres det.
  const startRedusert = redusertBevegelse() || rot.dataset.motion === 'av';
  rot.dataset.motionKlar = 'true';
  rot.dataset.motion = startRedusert ? 'av' : 'på';

  const b = lesBevegelse();

  if (!startRedusert) {
    const hero = heroIntro(b);
    if (hero) registrerOpprydding(hero);
  }

  const mm = gsap.matchMedia();
  // `alle` sørger for at callbacken kjører også når verken desktop eller redusert treffer (mobil).
  mm.add({ alle: 'all', desktop: DESKTOP, redusert: REDUSERT }, (ctx) => {
    const { desktop, redusert } = ctx.conditions as { desktop: boolean; redusert: boolean };
    const avslatt = redusert || startRedusert;
    rot.dataset.motion = avslatt ? 'av' : 'på';

    const stoppLenis = avslatt ? undefined : startLenis();
    stasjoner(b, avslatt);
    if (!avslatt) tunnelovergang(b);
    if (desktop && !avslatt) sporlinjeDesktop(b);
    const skjulGjeldende = desktop ? undefined : fremdriftMobil(b, avslatt);
    const slippMateriell = desktop && !avslatt ? materiellPin(b) : undefined;

    return () => {
      stoppLenis?.();
      skjulGjeldende?.();
      slippMateriell?.();
    };
  });
  registrerOpprydding(() => mm.revert());

  document.addEventListener('astro:before-swap', ryddOpp, { once: true });
}

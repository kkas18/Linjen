// Lysboks (6.3): åpnes fra galleriknapper med data-lysboks-apne="<indeks>" og
// data-lysboks-mal="<dialog-id>". Tastatur: ←/→ blar, Esc lukker (native). Sveip blar.

interface Bilde {
  src: string | null;
  alt: string;
  bildetekst: string;
  kreditering: string;
}

const SVEIP_PX = 50;

export function initLysboks(dialog: HTMLDialogElement): void {
  const bilder: Bilde[] = JSON.parse(
    dialog.querySelector('[data-lysboks-data]')?.textContent ?? '[]',
  );
  const flate = dialog.querySelector<HTMLElement>('[data-lysboks-bilde]');
  const tekst = dialog.querySelector<HTMLElement>('[data-lysboks-bildetekst]');
  const kreditering = dialog.querySelector<HTMLElement>('[data-lysboks-kreditering]');
  const teller = dialog.querySelector<HTMLElement>('[data-lysboks-teller]');
  if (!flate || bilder.length === 0) return;

  let gjeldende = 0;
  let apner: HTMLElement | null = null;

  function vis(i: number): void {
    gjeldende = (i + bilder.length) % bilder.length;
    const b = bilder[gjeldende];
    flate!.replaceChildren();
    if (b.src) {
      const img = document.createElement('img');
      img.src = b.src;
      img.alt = b.alt;
      img.decoding = 'async';
      flate!.append(img);
    } else {
      const plass = document.createElement('div');
      plass.className = 'lysboks__plassholder';
      plass.setAttribute('role', 'img');
      plass.setAttribute('aria-label', b.alt || 'Bilde kommer');
      const etikett = document.createElement('span');
      etikett.className = 't-etikett';
      etikett.textContent = 'Bilde kommer';
      plass.append(etikett);
      flate!.append(plass);
    }
    if (tekst) tekst.textContent = b.bildetekst;
    if (kreditering) kreditering.textContent = b.kreditering;
    if (teller) teller.textContent = `${gjeldende + 1} / ${bilder.length}`;
  }

  document.querySelectorAll<HTMLElement>(`[data-lysboks-mal="${dialog.id}"]`).forEach((knapp) => {
    knapp.addEventListener('click', () => {
      apner = knapp;
      vis(Number(knapp.dataset.lysboksApne ?? 0));
      dialog.showModal();
    });
  });

  dialog
    .querySelector('[data-lysboks-forrige]')
    ?.addEventListener('click', () => vis(gjeldende - 1));
  dialog.querySelector('[data-lysboks-neste]')?.addEventListener('click', () => vis(gjeldende + 1));
  dialog.querySelector('[data-lysboks-lukk]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') vis(gjeldende - 1);
    else if (e.key === 'ArrowRight') vis(gjeldende + 1);
  });

  // Fokus tilbake til bildet som ble klikket.
  dialog.addEventListener('close', () => apner?.focus());

  // Sveip på berøringsskjerm.
  let startX: number | null = null;
  dialog.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
  });
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > SVEIP_PX) vis(gjeldende + (dx < 0 ? 1 : -1));
  });
}

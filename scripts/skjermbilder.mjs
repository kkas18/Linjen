// Tar Playwright-skjermbilder av forsiden i mobil- og desktopstørrelse.
// Bruk: npm run build && npm run skjermbilder [-- fase-1]
// Sett CHROMIUM_PATH hvis Playwright ikke finner sin egen nettleser.

import { spawn, spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const mappe = `screenshots/${process.argv[2] ?? 'fase-1'}`;
const port = 4329;
const base = process.env.BASE_PATH ?? '/Linjen';
const adresse = `http://localhost:${port}${base.replace(/\/$/, '')}/`;

const storrelser = [
  { navn: 'mobil-390x844', width: 390, height: 844, mobil: true },
  { navn: 'desktop-1440x900', width: 1440, height: 900, mobil: false },
];

const vent = (ms) => new Promise((r) => setTimeout(r, ms));

async function ventPaServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const svar = await fetch(adresse);
      if (svar.ok) return;
    } catch {
      /* ikke klar ennå */
    }
    await vent(200);
  }
  throw new Error(`Fikk ikke kontakt med ${adresse}`);
}

/** Scroller rolig gjennom siden så alle scroll-animasjoner blir utløst. */
async function kjorGjennom(side) {
  const hoyde = await side.evaluate(() => document.documentElement.scrollHeight);
  const steg = await side.evaluate(() => window.innerHeight / 3);
  for (let y = 0; y <= hoyde; y += steg) {
    await side.mouse.wheel(0, steg);
    await vent(120);
  }
  await vent(1500);
}

// Astro 7 starter `preview` som bakgrunnstjeneste; den stoppes med `astro preview stop` til slutt.
const server = spawn('npx', ['astro', 'preview', '--port', String(port)], { stdio: 'ignore' });

try {
  await ventPaServer();
  await mkdir(mappe, { recursive: true });
  const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });

  for (const s of storrelser) {
    const side = await nettleser.newPage({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: s.mobil ? 3 : 1,
      isMobile: s.mobil,
      hasTouch: s.mobil,
    });
    await side.goto(adresse, { waitUntil: 'networkidle' });
    await side.evaluate(() => document.fonts.ready);
    await vent(2500); // hero-intro
    await side.screenshot({ path: `${mappe}/${s.navn}-hero.png` });

    if (s.mobil) {
      // Touch-scroll: hopp direkte, la ScrollTrigger fange opp.
      await side.evaluate(() => {
        document.querySelector('[data-stasjon]')?.scrollIntoView();
        window.scrollBy(0, -80);
      });
      await vent(2000);
    } else {
      await side.mouse.move(s.width / 2, s.height / 2);
      await kjorGjennom(side);
      await side.evaluate(() => {
        const skilt = document.querySelector('[data-stasjon-skilt]');
        if (skilt) window.scrollTo(0, skilt.getBoundingClientRect().top + window.scrollY - 120);
      });
      await vent(1500);
    }
    await side.screenshot({ path: `${mappe}/${s.navn}-stasjon.png` });

    if (s.mobil) {
      await side.evaluate(() => window.scrollBy(0, window.innerHeight));
      await vent(2000);
      await side.screenshot({ path: `${mappe}/${s.navn}-stasjon-bilde.png` });
    }

    // Helside tas fra toppen, ellers havner faste elementer (navigasjon) midt på bildet.
    await side.evaluate(() => window.scrollTo(0, 0));
    await vent(2000);
    await side.screenshot({ path: `${mappe}/${s.navn}-helside.png`, fullPage: true });
    await side.close();
  }

  await nettleser.close();
  console.warn(`Skjermbilder lagret i ${mappe}/`);
} finally {
  server.kill();
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
}

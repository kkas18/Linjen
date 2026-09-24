// Tar Playwright-skjermbilder av forsiden og undersidene i mobil- og desktopstørrelse.
// Bruk: npm run build && npm run skjermbilder [-- fase-2]
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

// Punkter på forsiden som fotograferes (hoppes over hvis elementet ikke finnes).
const punkter = [
  { navn: 'stasjon', sel: '[data-stasjon-skilt]', forskyvning: -120 },
  { navn: 'inn-i-tunnel', sel: '#t-banen', forskyvning: -450 },
  { navn: 'tunnel', sel: '#t-banen', forskyvning: -80 },
  { navn: 'ut-av-tunnel', sel: '#sporveien', forskyvning: -300 },
  { navn: 'materiell', sel: '[data-materiell]', forskyvning: 0 },
  { navn: 'avslutning', sel: '.avslutning', forskyvning: -80 },
];

const vent = (ms) => new Promise((r) => setTimeout(r, ms));

// Undersider som fotograferes i full høyde, med en valgfri handling etterpå.
const undersider = [
  { navn: 'epokeside', sti: 'epoker/t-banen/' },
  {
    navn: 'epokeside-hest',
    sti: 'epoker/hestesporveien/',
    handlingNavn: 'lysboks',
    handling: (side) => side.click('[data-lysboks-apne="0"]'),
  },
  {
    navn: 'nettverket',
    sti: 'nettverket/',
    handlingNavn: '1930',
    handling: async (side) => {
      await side.fill('[data-nettverk-glider]', '1930');
      await side.evaluate(() => window.scrollTo(0, 0));
      await vent(1200);
    },
  },
  { navn: 'signal', sti: 'signal/' },
  { navn: 'materiell', sti: 'materiell/' },
  { navn: 'kilder', sti: 'kilder/' },
  { navn: 'om', sti: 'om/' },
];

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
async function kjorGjennom(side, mobil) {
  const hoyde = await side.evaluate(() => document.documentElement.scrollHeight);
  const steg = await side.evaluate(() => Math.round(window.innerHeight / 3));
  for (let y = 0; y <= hoyde; y += steg) {
    if (mobil) await side.evaluate((ny) => window.scrollTo(0, ny), y);
    else await side.mouse.wheel(0, steg);
    await vent(60);
  }
  await vent(1500);
}

async function scrollTil(side, sel, forskyvning) {
  const funnet = await side.evaluate(
    ([s, f]) => {
      const el = document.querySelector(s);
      if (!el) return false;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + f);
      return true;
    },
    [sel, forskyvning],
  );
  if (funnet) await vent(1800);
  return funnet;
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

    await side.mouse.move(s.width / 2, s.height / 2);
    await kjorGjennom(side, s.mobil);

    for (const p of punkter) {
      if (await scrollTil(side, p.sel, p.forskyvning)) {
        await side.screenshot({ path: `${mappe}/${s.navn}-${p.navn}.png` });
      }
    }

    // Helside tas fra toppen, ellers havner faste elementer (navigasjon) midt på bildet.
    await side.evaluate(() => window.scrollTo(0, 0));
    await vent(2000);
    await side.screenshot({ path: `${mappe}/${s.navn}-helside.png`, fullPage: true });

    // Undersider (tas bare hvis de finnes i bygget)
    for (const u of undersider) {
      const svar = await side.goto(`${adresse}${u.sti}`, { waitUntil: 'networkidle' });
      if (!svar?.ok()) continue;
      await vent(2500);
      await side.screenshot({ path: `${mappe}/${s.navn}-${u.navn}.png`, fullPage: true });
      if (u.handling) {
        await u.handling(side);
        await vent(800);
        await side.screenshot({ path: `${mappe}/${s.navn}-${u.navn}-${u.handlingNavn}.png` });
      }
    }
    await side.close();
  }

  await nettleser.close();
  console.warn(`Skjermbilder lagret i ${mappe}/`);
} finally {
  server.kill();
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
}

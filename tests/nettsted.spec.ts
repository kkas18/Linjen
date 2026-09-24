import { expect, test, type Page } from '@playwright/test';
import { FORSTE, MED_FOR_ETTER, UTVALG } from './innhold';
// Sidetekstene hentes fra ordbøkene, så testene tåler at tekstene endres.
import { nb } from '../src/i18n/nb';
import { en } from '../src/i18n/en';
import { APPNAVN, TEMAFARGE } from '../pwa.config.mjs';

// Epokesidene hentes fra innholdsfilene, så testene ikke låses til bestemte slugs.
const SIDER = [
  '',
  ...UTVALG.map((slug) => `epoker/${slug}/`),
  'nettverket/',
  'signal/',
  'materiell/',
  'kilder/',
  'om/',
];

const SIDER_EN = [
  'en/',
  ...UTVALG.map((slug) => `en/eras/${slug}/`),
  'en/network/',
  'en/signalling/',
  'en/rolling-stock/',
  'en/sources/',
  'en/about/',
];

const BREDDER = [360, 390, 768, 1280, 1920];

/** En epoke fra nettverkskartets egne data (andre epoke hvis den finnes), til å velge et år. */
async function velgEpoke(page: Page): Promise<{ ar: number; tittel: string }> {
  const tekst = await page.locator('[data-nettverk-epoker]').textContent();
  const epoker: { ar: number; tittel: string }[] = JSON.parse(tekst ?? '[]');
  expect(epoker.length).toBeGreaterThan(0);
  return epoker[Math.min(1, epoker.length - 1)];
}

/** Samler JS-feil på siden. */
function feilfanger(page: Page): string[] {
  const feil: string[] = [];
  page.on('pageerror', (e) => feil.push(e.message));
  return feil;
}

test.describe('alle sider', () => {
  for (const sti of SIDER) {
    test(`/${sti} laster riktig`, async ({ page }) => {
      const feil = feilfanger(page);
      const svar = await page.goto(sti);
      expect(svar?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'nb');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/Linjen/);
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
      // Alle bilder skal ha alt-attributt
      expect(await page.locator('img:not([alt])').count()).toBe(0);
      expect(feil).toEqual([]);
    });
  }

  test('titlene er unike', async ({ page }) => {
    const titler = new Set<string>();
    for (const sti of SIDER) {
      await page.goto(sti);
      titler.add(await page.title());
    }
    expect(titler.size).toBe(SIDER.length);
  });
});

test.describe('engelsk versjon (fase 5)', () => {
  for (const sti of SIDER_EN) {
    test(`/${sti} laster riktig på engelsk`, async ({ page }) => {
      const feil = feilfanger(page);
      const svar = await page.goto(sti);
      expect(svar?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="nb"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      expect(await page.locator('img:not([alt])').count()).toBe(0);
      expect(feil).toEqual([]);
    });
  }

  test('titlene er unike på tvers av språk', async ({ page }) => {
    const titler = new Set<string>();
    for (const sti of [...SIDER, ...SIDER_EN]) {
      await page.goto(sti);
      titler.add(await page.title());
    }
    expect(titler.size).toBe(SIDER.length + SIDER_EN.length);
  });

  test('språkvelgeren går til samme side på det andre språket', async ({ page }) => {
    const slug = UTVALG[UTVALG.length - 1];
    await page.goto(`epoker/${slug}/`);
    const norskTittel = await page.locator('h1').textContent();
    await page.locator('.nav__sprak').click();
    await expect(page).toHaveURL(new RegExp(`/en/eras/${slug}/$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).not.toBeEmpty();
    await page.locator('.nav__sprak').click();
    await expect(page).toHaveURL(new RegExp(`/epoker/${slug}/$`));
    await expect(page.locator('h1')).toHaveText(norskTittel ?? '');
  });

  test('engelsk nettverkskart viser engelske hendelser og knapper', async ({ page }) => {
    await page.goto('en/network/');
    const epoke = await velgEpoke(page);
    const glider = page.locator('[data-nettverk-glider]');
    await glider.fill(String(epoke.ar));
    await glider.dispatchEvent('change');
    await expect(page.locator('[data-nettverk-epoke-tittel]')).toHaveText(epoke.tittel);
    await expect(page.locator('[data-nettverk-status]')).toContainText(en.nettverk.iDrift);
    const spill = page.locator('[data-nettverk-spill]');
    await expect(spill).toHaveText(en.nettverk.spill);
    await spill.click();
    await expect(spill).toHaveText(en.nettverk.pause);
    await spill.click();
  });

  test('sitemap har begge språk med hreflang', async ({ request, baseURL }) => {
    const sitemap = await (await request.get(`${baseURL}sitemap.xml`)).text();
    expect(sitemap).toContain(`/en/eras/${FORSTE}/`);
    expect(sitemap).toContain('hreflang="en"');
  });

  test('404 er tospråklig', async ({ page }) => {
    await page.goto('en/finnes-ikke/');
    await expect(page.locator('h1')).toHaveText(nb.feil.h1);
    await expect(page.locator('.feil__en')).toContainText(en.feil.h1);
  });
});

test.describe('responsivt', () => {
  test.skip(({ isMobile }) => isMobile, 'bredder testes fra desktop-prosjektet');
  for (const bredde of BREDDER) {
    test(`ingen horisontal scroll ved ${bredde} px`, async ({ page }) => {
      await page.setViewportSize({ width: bredde, height: 900 });
      for (const sti of [...SIDER, ...SIDER_EN]) {
        await page.goto(sti);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const bredt = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(bredt, `/${sti}`).toBeLessThanOrEqual(bredde);
      }
    });
  }
});

test.describe('tilgjengelighet', () => {
  test('hopp til innhold', async ({ page }) => {
    await page.goto('om/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.hopp-lenke')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#innhold$/);
  });

  test('mobilmeny: åpner, Esc lukker og fokus går tilbake', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'kun mobil');
    await page.goto('om/');
    const knapp = page.locator('[data-menyknapp]');
    await knapp.click();
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobilmeny a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(knapp).toBeFocused();
  });

  test('redusert bevegelse: alt vises ferdig og signalene er grønne', async ({ browser }) => {
    const kontekst = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await kontekst.newPage();
    await page.goto('');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'av');
    await expect(page.locator('#hero-tittel')).toBeVisible();
    const signaler = page.locator('[data-stasjon] [data-signal]');
    const antall = await signaler.count();
    expect(antall).toBeGreaterThan(0);
    for (let i = 0; i < antall; i++) {
      await expect(signaler.nth(i)).toHaveAttribute('data-signal', 'gronn');
    }
    await kontekst.close();
  });
});

test.describe('signaturfunksjoner', () => {
  test('nettverkskart: glider, piltaster, avspilling og aria-live', async ({ page }) => {
    await page.goto('nettverket/');
    const epoke = await velgEpoke(page);
    const glider = page.locator('[data-nettverk-glider]');
    await glider.fill(String(epoke.ar));
    await glider.dispatchEvent('change');
    await expect(page.locator('[data-nettverk-ar]')).toHaveText(String(epoke.ar));
    await expect(page.locator('[data-nettverk-status]')).toContainText(String(epoke.ar));
    await expect(page.locator('[data-nettverk-epoke-tittel]')).toHaveText(epoke.tittel);
    await glider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-nettverk-ar]')).toHaveText(String(epoke.ar + 1));

    const spill = page.locator('[data-nettverk-spill]');
    await spill.click();
    await expect(spill).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(500);
    await spill.click();
    await expect(spill).toHaveAttribute('aria-pressed', 'false');
    expect(Number(await page.locator('[data-nettverk-ar]').textContent())).toBeGreaterThan(
      epoke.ar + 1,
    );
  });

  test('signaldemo går gjennom alle signalbildene og starter på nytt', async ({ page }) => {
    await page.goto('signal/');
    const bilder: { tilstand: string; navn: string }[] = JSON.parse(
      (await page.locator('[data-demo-bilder]').textContent()) ?? '[]',
    );
    expect(bilder.length).toBeGreaterThan(1);
    const signal = page.locator('[data-demo-signal]');
    const knapp = page.locator('[data-demo-knapp]');
    for (let i = 0; i <= bilder.length; i++) {
      const b = bilder[i % bilder.length];
      await expect(signal).toHaveAttribute('data-tilstand', b.tilstand);
      await expect(page.locator('[data-demo-navn]')).toHaveText(b.navn);
      await knapp.click();
    }
  });

  test('lysboks: åpne, bla med piltaster, Esc og fokus tilbake', async ({ page }) => {
    await page.goto(`epoker/${FORSTE}/`);
    const antall = await page.locator('[data-lysboks-apne]').count();
    expect(antall).toBeGreaterThan(0);
    const start = Math.min(1, antall - 1);
    const apne = page.locator(`[data-lysboks-apne="${start}"]`);
    await apne.click();
    const dialog = page.locator('[data-lysboks]');
    await expect(dialog).toBeVisible();
    const teller = page.locator('[data-lysboks-teller]');
    await expect(teller).toHaveText(`${start + 1} / ${antall}`);
    await page.keyboard.press('ArrowRight');
    await expect(teller).toHaveText(`${((start + 1) % antall) + 1} / ${antall}`);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(apne).toBeFocused();
  });

  test('før/etter-glider med piltaster', async ({ page }) => {
    test.skip(!MED_FOR_ETTER, 'ingen epoke har før/etter-glider');
    await page.goto(`epoker/${MED_FOR_ETTER}/`);
    const glider = page.locator('[data-for-etter-glider]');
    await glider.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowLeft');
    const pos = await page
      .locator('[data-for-etter]')
      .evaluate((el) => (el as HTMLElement).style.getPropertyValue('--pos'));
    expect(pos).toBe('40%');
  });
});

test.describe('ferdigstilling', () => {
  test('404-side', async ({ page }) => {
    const svar = await page.goto('finnes-ikke/');
    expect(svar?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText(nb.feil.h1);
  });

  test('PWA-manifest, sitemap og OG-bilde', async ({ page, request, baseURL }) => {
    const manifest = await (await request.get(`${baseURL}manifest.webmanifest`)).json();
    expect(manifest.name).toBe(APPNAVN);
    expect(manifest.theme_color).toBe(TEMAFARGE);
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);

    const sitemap = await (await request.get(`${baseURL}sitemap.xml`)).text();
    expect(sitemap).toContain(`/epoker/${FORSTE}/`);

    await page.goto(`epoker/${FORSTE}/`);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(new RegExp(`og/${FORSTE}\\.png$`));
    const bilde = await request.get(`${baseURL}og/${FORSTE}.png`);
    expect(bilde.status()).toBe(200);
  });

  test('skjermbilder av forsiden', async ({ page }, info) => {
    await page.goto('');
    await page.waitForTimeout(2500);
    await info.attach('forside', { body: await page.screenshot(), contentType: 'image/png' });
    await page.goto('nettverket/');
    await info.attach('nettverket', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
});

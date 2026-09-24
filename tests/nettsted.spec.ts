import { expect, test, type Page } from '@playwright/test';

const SIDER = [
  '',
  'epoker/hestesporveien/',
  'epoker/t-banen/',
  'epoker/framtiden/',
  'nettverket/',
  'signal/',
  'materiell/',
  'kilder/',
  'om/',
];

const BREDDER = [360, 390, 768, 1280, 1920];

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

test.describe('responsivt', () => {
  test.skip(({ isMobile }) => isMobile, 'bredder testes fra desktop-prosjektet');
  for (const bredde of BREDDER) {
    test(`ingen horisontal scroll ved ${bredde} px`, async ({ page }) => {
      await page.setViewportSize({ width: bredde, height: 900 });
      for (const sti of SIDER) {
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
    const glider = page.locator('[data-nettverk-glider]');
    await glider.fill('1900');
    await glider.dispatchEvent('change');
    await expect(page.locator('[data-nettverk-ar]')).toHaveText('1900');
    await expect(page.locator('[data-nettverk-status]')).toContainText('1900');
    await expect(page.locator('[data-nettverk-epoke-tittel]')).toHaveText('Banene til åsene');
    await glider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-nettverk-ar]')).toHaveText('1901');

    const spill = page.locator('[data-nettverk-spill]');
    await spill.click();
    await expect(spill).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(500);
    await spill.click();
    await expect(spill).toHaveAttribute('aria-pressed', 'false');
    expect(Number(await page.locator('[data-nettverk-ar]').textContent())).toBeGreaterThan(1901);
  });

  test('signaldemo går gjennom tre signalbilder', async ({ page }) => {
    await page.goto('signal/');
    const signal = page.locator('[data-demo-signal]');
    const knapp = page.locator('[data-demo-knapp]');
    await expect(signal).toHaveAttribute('data-tilstand', 'rod');
    await knapp.click();
    await expect(signal).toHaveAttribute('data-tilstand', 'gul');
    await knapp.click();
    await expect(signal).toHaveAttribute('data-tilstand', 'gronn');
    await knapp.click();
    await expect(signal).toHaveAttribute('data-tilstand', 'rod');
  });

  test('lysboks: åpne, bla med piltaster, Esc og fokus tilbake', async ({ page }) => {
    await page.goto('epoker/hestesporveien/');
    const apne = page.locator('[data-lysboks-apne="1"]');
    await apne.click();
    const dialog = page.locator('[data-lysboks]');
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-lysboks-teller]')).toHaveText('2 / 3');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lysboks-teller]')).toHaveText('3 / 3');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(apne).toBeFocused();
  });

  test('før/etter-glider med piltaster', async ({ page }) => {
    await page.goto('epoker/hestesporveien/');
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
    await expect(page.locator('h1')).toHaveText('Denne siden finnes ikke');
  });

  test('PWA-manifest, sitemap og OG-bilde', async ({ page, request, baseURL }) => {
    const manifest = await (await request.get(`${baseURL}manifest.webmanifest`)).json();
    expect(manifest.name).toBe('Linjen – Sporveiens historie');
    expect(manifest.theme_color).toBe('#0F1216');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);

    const sitemap = await (await request.get(`${baseURL}sitemap.xml`)).text();
    expect(sitemap).toContain('/epoker/hestesporveien/');

    await page.goto('epoker/hestesporveien/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(/og\/hestesporveien\.png$/);
    const bilde = await request.get(`${baseURL}og/hestesporveien.png`);
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

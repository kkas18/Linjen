# Kvalitetsrapport – Fase 4

Gjennomgang av kvalitetskravene i CLAUDE.md kapittel 8. Målt lokalt 24.09.2026 på bygget i denne
grenen. Lighthouse og Playwright kjører også automatisk på hver PR (`.github/workflows/kvalitet.yml`).

**Status:** ✅ oppfylt · 🟡 delvis / avhenger av innhold · ❌ ikke oppfylt

## Oppsummering

| Område                | Status | Kort                                                                               |
| --------------------- | ------ | ---------------------------------------------------------------------------------- |
| Ytelse (Lighthouse)   | ✅     | Mobil 95–100 på alle målte sider                                                   |
| LCP < 2,0 s på 4G     | 🟡     | Median 2,0–2,1 s lokalt, stor spredning (0,8–2,4 s); må bekreftes i CI og med foto |
| JS forside < 90 kB gz | ✅     | 59 kB gz (+ 2,2 kB service worker-hjelper som lastes etterpå)                      |
| Tilgjengelighet       | ✅     | Lighthouse 100, kontrast ≥ 5,96:1 for all tekst, tastatur og redusert bevegelse    |
| Responsivt            | ✅     | Ingen horisontal scroll på 360, 390, 768, 1280, 1920 px (testet automatisk)        |
| SEO / deling          | ✅     | Unik tittel og beskrivelse, OG-bilde per epoke, sitemap, `lang="nb"`               |
| Personvern            | ✅     | Ingen informasjonskapsler, sporing eller tredjepartsforespørsler                   |
| PWA                   | ✅     | Manifest, ikoner 192/512 + maskerbar, offline for besøkte sider (verifisert)       |
| Kode                  | ✅     | Prettier, ESLint, ingen `console.log`, én GSAP-modul                               |

## 1. Ytelse

Lighthouse CI, mobil (standard 4G-simulering), 3 kjøringer per side, bygg med `BASE_PATH=/`:

| Side                      | Ytelse | Tilgjengelighet | Beste praksis | SEO | LCP (spredning) |
| ------------------------- | ------ | --------------- | ------------- | --- | --------------- |
| `/`                       | 95–97  | 100             | 100           | 100 | 2,0–2,4 s       |
| `/epoker/hestesporveien/` | 95–100 | 100             | 100           | 100 | 0,9–2,4 s       |
| `/nettverket/`            | 97–100 | 100             | 100           | 100 | 0,8–2,1 s       |
| `/signal/`                | 97–100 | 100             | 100           | 100 | 0,9–2,1 s       |

- ✅ **Poengkrav ≥ 95:** Oppfylt i alle kjøringer. Lighthouse CI stopper bygget hvis en kategori faller under 95.
- 🟡 **LCP < 2,0 s:** Samme side veksler mellom rundt 0,9 s og 2,1–2,4 s. LCP følger første maling (FCP), så spredningen kommer mest sannsynlig fra støy i testmiljøet, ikke fra siden. Det som er gjort:
  - All CSS legges rett i HTML (`inlineStylesheets: 'always'`), så ingen stilark blokkerer visningen.
  - Forhåndslasting av fonter ble testet og gjorde LCP verre, så den er ikke med.
  - Lighthouse CI varsler når median-LCP er over 2,0 s. Første kjøring i GitHub Actions gir et mer stabilt tall.
- 🟡 **Hero-foto:** Hero-bildet får `fetchpriority="high"` og alle andre bilder `loading="lazy"`. Hero har foreløpig bare en plassholder, så LCP med ekte arkivfoto (AVIF/WebP via `<Picture>`) må måles når fotoet er på plass.
- ✅ **JS for forsiden:** 59,1 kB gz, fordelt på `motion.ts` med GSAP og Lenis (57,2 kB), navigasjon og service worker-registrering (1,2 kB) og innebygde skript (0,6 kB). I tillegg kommer `workbox-window` (2,2 kB), som lastes etter at siden er vist.

## 2. Tilgjengelighet (WCAG 2.1 AA)

Kontrast, beregnet fra tokens.css:

| Tekst / bakgrunn                                 | Kontrast | Krav 4,5:1 |
| ------------------------------------------------ | -------- | ---------- |
| `--c-grafitt` på `--c-perrong`                   | 15,45:1  | ✅         |
| `--c-grafitt-2` på `--c-perrong`                 | 5,96:1   | ✅         |
| `--c-trikkebla` (lenker) på `--c-perrong`        | 6,91:1   | ✅         |
| `--c-grafitt-2` på `--c-flate`                   | 6,87:1   | ✅         |
| `--c-lys-tekst` på `--c-tunnel`                  | 15,56:1  | ✅         |
| `--c-lys-tekst-2` på `--c-tunnel`                | 7,35:1   | ✅         |
| `--c-lys-tekst-2` på `--c-tunnel-2` (hero)       | 6,70:1   | ✅         |
| `--c-lys-tekst` på `--c-trikkebla` (aktiv knapp) | 6,60:1   | ✅         |

- ✅ **Lenker i tunnelseksjonene:** Trikkeblått ville hatt for lav kontrast på mørk bakgrunn, så lenkene bytter til `--c-lys-tekst`.
- ✅ **Fokusmarkering:** 2 px `--c-trikkebla` med 2 px avstand. I lysboksen brukes lys farge på mørk bakgrunn.
- ✅ **Hopp-til-innhold-lenke:** Testet automatisk.
- ✅ **Én H1 per side:** Testet automatisk. H2 brukes per stasjon og seksjon.
- ✅ **Alt-tekst:** Alle `<img>` har `alt` (testet automatisk). Bygget feiler hvis et bilde mangler `alt`, `lisens` eller `kilde`.
- ✅ **Redusert bevegelse:** Scroll-animasjoner og Lenis er av, alt innhold vises ferdig og signalene er grønne (testet automatisk). Uten JavaScript vises også alt.
- ✅ **Tastatur:**
  - Mobilmenyen lukkes med Esc, og resten av siden er utilgjengelig (`inert`) mens den er åpen.
  - Nettverksglideren flyttes med piltastene, og året leses opp via `aria-live`.
  - Lysboksen blar med ←/→ og lukkes med Esc, og fokus går tilbake til bildet som ble klikket.
  - Før/etter-glideren styres med piltastene.
- 🟡 **Ikke gjort:** Manuell test med skjermleser (NVDA/VoiceOver/TalkBack) bør gjøres før lansering.

## 3. Responsivt

- ✅ **Bredder:** Ingen horisontal scroll på `body` ved 360, 390, 768, 1280 og 1920 px, testet for alle sidetyper.
- ✅ **Skjermbilder:** Mobil 390 × 844 (S24) og desktop 1440 × 900 ligger i `screenshots/fase-1` til `fase-4`.

## 4. SEO og deling

- ✅ **Tittel og beskrivelse:** Unik `<title>` og beskrivelse per side (testet automatisk). Hver side har også kanonisk lenke.
- ✅ **OG-bilder:** 1200 × 630, generert ved bygg (`scripts/og.mjs`, Playwright med de ekte fontene). Det finnes ett bilde per epoke og ett for forsiden.
- ✅ **`sitemap.xml`:** Via eget endepunkt, uten nytt bibliotek.
- ✅ **`lang`:** `lang="nb"` på alle sider.
- 🟡 **`robots.txt`:** Ligger under `/Linjen/`. Søkemotorer leser bare `robots.txt` på domenets rot, så filen får først effekt med eget domene. Sitemapen kan i mellomtiden meldes inn direkte.

## 5. Personvern

- ✅ **Ingen informasjonskapsler, sporing eller analyseverktøy.**
- ✅ **Ingen tredjepartsforespørsler når siden brukes.** Fonter, skript og bilder ligger på nettstedet selv. Bygget er kontrollert for eksterne `src`/`href`: det finnes bare egne kanoniske lenker.
- ✅ **Samtykkebanner trengs ikke.**

## 6. PWA

- ✅ **Manifest:** Navn «Linjen – Sporveiens historie», temafarge `#0F1216`, `start_url` og `scope` under base-stien.
- ✅ **Ikoner:** 192 og 512 px pluss maskerbart ikon, favicon (SVG) og apple-touch-icon. Alle genereres med `npm run ikoner`.
- ✅ **Offline:** Verifisert ved å stoppe serveren. Besøkte sider (NetworkFirst) og bilder (CacheFirst) virker uten nett, mens sider som ikke er besøkt ikke gjør det, slik kravet sier. Skallet (CSS, JS, latinske fonter, ikoner) forhåndslagres.
- ✅ **`@vite-pwa/astro` med Astro 7:** Pakken støtter offisielt bare Astro ≤ 5, men fungerer med en npm-override for peer-avhengigheten. Manifest og service worker genereres riktig.
- 🟡 **Temafarge:** Må være en fast verdi i manifest og `<meta>`. Den ligger derfor i `pwa.config.mjs` som eneste bevisste unntak fra token-regelen, med kommentar om at den tilsvarer `--c-tunnel`.

## 7. Kode

- ✅ **Prettier og ESLint:** Kjøres i CI. `astro check` gir 0 feil, 0 advarsler og 0 hint.
- ✅ **Ingen `console.log`:** ESLint-regelen `no-console` er aktiv. Byggeskriptene bruker `console.warn` for statusmeldinger.
- ✅ **Én animasjonsmodul:** `src/scripts/motion.ts` eier all GSAP-, ScrollTrigger-, SplitText- og Lenis-kode og rydder opp ved navigasjon. Nettverkskartet, lysboksen og før/etter-glideren bruker vanlig TS og CSS-overganger.
- ✅ **Ingen fargekoder i komponentene:** Farger står bare i `tokens.css`, med unntak av PWA-konstanten over og byggeskriptet for ikoner.

## 8. Testdekning

- **`npm test`** (Playwright, mobil og desktop): 44 tester.
  - Alle sider: status, `lang`, én H1, beskrivelse, `alt` og ingen JS-feil.
  - Unike titler og ingen horisontal scroll på 5 bredder.
  - Hopp-lenke, mobilmeny og redusert bevegelse.
  - Nettverkskart, signaldemo, lysboks og før/etter-glider.
  - 404-siden, manifest, sitemap og OG-bilder.
  - Skjermbilder lagres som vedlegg.
- **`npm run lhci`** (Lighthouse CI): 4 sider × 3 kjøringer. Bygget stopper hvis en kategori faller under 95.

## Gjenstår – krever innhold eller handling fra eier

1. **Bilder:** Hero-foto, hovedbilder, gallerier, før/etter-bilder og materiellfoto, med `alt`, fotograf, år, arkiv, lisens og kilde.
2. **Tekster:** Epoketekster utover stikkordene i CLAUDE.md, signalhistorien (`src/content/signal/`) og siden «Om» (alt merket `[[TODO]]`).
3. **Kildeliste:** Legges i `src/data/kilder.json`.
4. **Materiell:** Liste over vogntyper (`src/content/materiell/`).
5. **Nettverkskartet:** `path`-data og åpnings- og nedleggelsesår (`src/data/nettverk.json`).
6. **Signalbildene i demoen:** Bekreft dem, eller lever de riktige signalbildene for Sporveien.
7. **GitHub Pages:** Slå på under Settings → Pages → Source: «GitHub Actions».
8. **Etter lansering:** Mål LCP på nytt med ekte hero-foto, og test med skjermleser.

## Tillegg – Fase 5 (engelsk versjon)

Målt 24.09.2026 etter at den engelske versjonen kom på plass.

- ✅ **Oppsett:** Astro i18n med `nb` som standardspråk på dagens adresser og `en` under `/en/`. Sidene har engelske navn: `/en/eras/[slug]/`, `/en/network/`, `/en/signalling/`, `/en/rolling-stock/`, `/en/sources/` og `/en/about/`.
- ✅ **Innhold i egne filer:** `src/content/en/{epoker,signal,materiell}` og `src/data/nettverk.en.json`. Bygget stopper hvis en epoke eller et nettverkssegment mangler motpart på det andre språket.
- ✅ **Grensesnitt:** Alle tekster ligger i `src/i18n/nb.ts` og `en.ts` (britisk engelsk). TypeScript sørger for at begge ordbøkene har de samme nøklene.
- ✅ **Språkinformasjon:** `lang="en"`, `og:locale en_GB` og `hreflang`-alternativer med `x-default` på alle sider. Sitemapen har `xhtml:link` for begge språk, og det finnes engelske OG-bilder (`og/en-*.png`).
- ✅ **Språkvelger:** Går til samme side på det andre språket. Det tilgjengelige navnet («Norsk (NB)» / «English (EN)») inneholder den synlige teksten (WCAG 2.5.3).
- ✅ **404:** Siden er tospråklig, fordi GitHub Pages har én 404-side for hele nettstedet.
- ✅ **Lighthouse mobil:** `/en/` og `/en/eras/hestesporveien/` får 95–100 i Ytelse og 100 i Tilgjengelighet, Beste praksis og SEO.
- ✅ **Playwright:** 72 tester er bestått, inkludert alle engelske sider, språkvelgeren, det engelske nettverkskartet, sitemap og 404.
- 🟡 **Oversettelsen:** Gjort fra de norske tekstene uten nye fakta, og `[[TODO]]` er beholdt der innholdet mangler. Den bør leses gjennom av eier eller en annen før lansering.
- 🟡 **Epoke-slugs:** Er de samme på begge språk, for eksempel `/en/eras/elektrisk-trikk/`, fordi det er de som kobler hver engelsk side til sin norske motpart.

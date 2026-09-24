# CLAUDE.md — «Linjen» · Sporveiens historie 1875–i dag

Du bygger et nytt, statisk nettsted om historien til Sporveien (Oslos trikk og T-bane).
Denne filen er fasit. Følg den nøyaktig. Ikke finn på et nytt designkonsept, ikke bytt farger,
fonter eller layout, og ikke legg til biblioteker som ikke står her uten å spørre først.

---

## 0. Arbeidsregler (les først)

1. **Planlegg før du bygger.** Start hver fase i plan-modus: skriv en kort plan (filer som opprettes/endres, rekkefølge), vent på godkjenning.
2. **Én fase om gangen.** Stopp etter hver fase, oppsummer hva som er gjort i maks 10 linjer, og vent. Ikke start neste fase selv.
3. **Ikke dikt opp historie.** Bruk kun fakta fra denne filen og `src/content/`. Mangler noe, skriv `[[TODO: …]]` i teksten.
4. **Ingen bilder fra nettet i koden.** Alle bilder ligger lokalt i `src/assets/photos/`. Mangler bilde: bruk komponenten `<PhotoPlaceholder>` (grå flate med tekst «Bilde kommer»), aldri et tilfeldig stockbilde eller en generert illustrasjon.
5. **Kun designtokens.** Alle farger, avstander, radier og tider hentes fra `src/styles/tokens.css`. Ingen hardkodede hex-verdier i komponenter.
6. **Små diff-er.** Endre bare det oppgaven gjelder. Ikke refaktorer eller «forbedre» andre deler.
7. **Git-commit etter hver fase** med melding `fase-N: <kort beskrivelse>`.
8. Svar og kodekommentarer på norsk. All synlig tekst på nettstedet er norsk bokmål.

---

## 1. Mål og målgruppe

- Et elegant, redaksjonelt nettsted med premium følelse som forteller Sporveiens historie fra hestesporveien i 1875 til dagens T-bane, trikk og framtidige signalsystem.
- Målgruppe: allmennheten, ansatte, sporveisentusiaster. Må fungere like godt på mobil (primært Samsung Galaxy S24, stående) som på stor skjerm.
- Følelse: presist, rolig, ingeniørmessig vakkert. Tenk god museumsutstilling møter signalteknisk sporplan. **Ikke** nostalgisk papir-estetikk.

---

## 2. Teknologi (fast)

| Del | Valg |
|---|---|
| Rammeverk | Astro 7 (statisk output), TypeScript |
| Innhold | Astro Content Collections (Markdown + frontmatter, validert med Zod) |
| Animasjon | GSAP 3 med ScrollTrigger og SplitText (gratis) |
| Myk scroll | Lenis (koblet til GSAP ticker) |
| Bilder | `astro:assets` (`<Picture>`), AVIF + WebP, `sharp` |
| Fonter | Selvhostet via `@fontsource-variable/source-serif-4`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono` |
| PWA | `@vite-pwa/astro` (offline for sider og bilder som er besøkt) |
| Test | Playwright (skjermbilder mobil + desktop), Lighthouse CI |
| Hosting | GitHub Pages via GitHub Actions |

Ingen CSS-rammeverk (ingen Tailwind). Vanlig CSS med tokens og CSS-moduler per komponent. Ingen React/Vue: bruk Astro-komponenter og små `<script>`-blokker.

---

## 3. Designkonsept: «Linjen»

Hele nettstedet er én sammenhengende linje, tegnet som en signalteknisk sporplan.

- En tynn vertikal **sporlinje** (SVG) går gjennom hele forsiden. Hver historisk epoke er en **stasjon** på linjen.
- Ved hver stasjon står et lite **signal** (tre lamper). Når stasjonen scrolles inn i bildet, skifter signalet fra rødt til grønt (kort, presis overgang, ingen glød).
- Et lite **tog-/trikkemerke** (enkel geometrisk form, 12 × 28 px) glir langs linjen i takt med scrollposisjonen og viser hvor i historien leseren er.
- Epoker før 1966 har lys bakgrunn. Når leseren kommer til T-banen (1966) går siden «ned i tunnelen»: bakgrunnen går over til mørk tunnelfarge. Etter Ringen (2006) kommer man opp igjen i lys.

### 3.1 Farger (`tokens.css`)

```css
:root {
  /* Flater */
  --c-perrong:   #EDEFF1;  /* hovedbakgrunn, kjølig lys grå – IKKE krem */
  --c-flate:     #FFFFFF;
  --c-tunnel:    #0F1216;  /* mørke seksjoner */
  --c-tunnel-2:  #181C22;

  /* Tekst */
  --c-grafitt:   #15181C;
  --c-grafitt-2: #535B66;
  --c-lys-tekst: #E7EAEE;
  --c-lys-tekst-2: #9AA3AE;

  /* Linjer */
  --c-skinne:    #B9C0C8;  /* sporlinje på lys bakgrunn */
  --c-skinne-mork: #3A414B;

  /* Aksent */
  --c-trikkebla: #1D4F9A;  /* eneste merkevare-aksent */

  /* Signal – KUN på signalelementer og statusmerker */
  --c-sig-rod:   #D22B3A;
  --c-sig-gul:   #EDB316;
  --c-sig-gronn: #1C9B5B;
  --c-sig-av:    #2A2F36;
}
```

Hvis eieren leverer Sporveiens offisielle profilfarger, byttes kun `--c-trikkebla`.

### 3.2 Typografi

| Rolle | Font | Størrelse (mobil → desktop, `clamp`) | Vekt |
|---|---|---|---|
| Display (epokeår) | IBM Plex Mono | 64 → 160 px, tabellsifre | 300 |
| Overskrift H1 | Source Serif 4 (opsz auto) | 40 → 88 px | 500 |
| Overskrift H2 | Source Serif 4 | 30 → 56 px | 500 |
| Ingress | Source Serif 4 | 19 → 24 px, linjehøyde 1.45 | 400 |
| Brødtekst | IBM Plex Sans | 17 → 18 px, linjehøyde 1.6, maks 66 tegn | 400 |
| Stasjonsskilt / etiketter | IBM Plex Sans, VERSALER, sperring 0.12em | 12 → 13 px | 600 |
| Bildetekst / kreditering | IBM Plex Sans | 13 px | 400 |

Forbudt: tunge grotesk-overskrifter, dekorative skrifter, tekst med glød eller gradient.

### 3.3 Layout og form

- 12-kolonners grid på desktop (maks bredde 1280 px), 4 kolonner på mobil. Sidemarg 20 px mobil, 48 px desktop.
- Sporlinjen ligger i venstre marg på desktop (x = 64 px) og som en tynn fremdriftslinje øverst på mobil (se 5.3).
- Hjørneradius: 2 px på bilder, 0 på alt annet. Ingen skygger unntatt `--shadow-lift: 0 1px 2px rgb(0 0 0 / .06), 0 8px 24px rgb(0 0 0 / .08)` på hover-kort.
- Avstandsskala (tokens): 4, 8, 12, 16, 24, 32, 48, 72, 112, 160 px.

### 3.4 Eksplisitt forbudt (generisk «AI-design»)

Ingen glødende blobs eller aurora-gradienter, ingen glassmorfisme, ingen krem-/papirtekstur, ingen halftone-raster, ingen kunstig filmkorn, ingen emoji som ikoner, ingen fargelegging av historiske foto med KI, ingen parallakse-lag med «svevende» dekor, ingen karuseller som går av seg selv.

### 3.5 Bevegelse (tokens)

```css
:root {
  --ease-out: cubic-bezier(.2, .7, .1, 1);
  --ease-inout: cubic-bezier(.65, 0, .35, 1);
  --t-rask: 180ms;
  --t-normal: 420ms;
  --t-sakte: 900ms;
}
```

Prinsipp: bevegelse skal se ut som presis mekanikk (sporveksel, signal, perrongdør), aldri sprettende eller elastisk.
`prefers-reduced-motion: reduce` → alle scroll-animasjoner av, innhold vises ferdig, Lenis av, signalene vises grønne.

---

## 4. Sidestruktur

```
/                      Forside: hele linjen, alle stasjoner (hovedopplevelsen)
/epoker/[slug]/        Utdypende side per epoke (lenket fra hver stasjon)
/materiell/            Vogner og tog gjennom tidene
/nettverket/           Interaktivt nettverkskart over tid
/signal/               Signalanleggets historie (fra manuell drift til CBTC)
/kilder/               Kilder, litteratur og bildekreditering
/om/                   Om nettstedet
404
```

Navigasjon: fast topplinje, 56 px høy, bakgrunn `--c-perrong` med 92 % opasitet og `backdrop-filter: blur(8px)` (eneste tillatte blur). Venstre: ordmerket «Linjen» i Source Serif 4. Høyre: Epoker · Materiell · Nettverket · Signal · Kilder. På mobil: menyknapp som åpner helskjermsmeny med samme lenker som store serif-lenker, åpnes med en vertikal «perrongdør»-wipe (clip-path, `--t-normal`).

---

## 5. Forsiden i detalj

### 5.1 Hero
- Fullskjerms (100svh) arkivfoto i svart-hvitt, `object-fit: cover`, lett mørk gradient nederst for lesbarhet (kun lineær, 0 → 55 % svart).
- Tekst nede til venstre:
  - Etikett: `SPORVEIEN · 1875 – I DAG`
  - H1: «Linjen gjennom byen»
  - Ingress: «Historien om hvordan hester, trikker og tog formet Oslo – fortalt stasjon for stasjon.»
- Animasjon ved lasting: bildet skaleres fra 1.06 til 1.0 over `--t-sakte`; H1 avdekkes linje for linje med SplitText (masket, fra y 100 % til 0, 80 ms mellom linjer); deretter tegnes sporlinjen nedover fra hero inn i innholdet (SVG `stroke-dashoffset`).
- Nederst i midten: liten tekst «Scroll for å kjøre» med en vertikal strek som pulserer én gang hvert 3. sekund (kun opasitet).

### 5.2 Stasjoner (én per epoke)
Hver stasjon er en seksjon med denne rekkefølgen:
1. **Stasjonsskilt**: hvit boks, 1 px ramme `--c-grafitt`, epokenavn i versaler + årstall i Plex Mono. Glir inn fra venstre 24 px + fade.
2. **Årstall** i display-størrelse. Teller opp fra forrige epokes år til sitt eget (GSAP, `--t-sakte`), tabellsifre så bredden ikke hopper.
3. **H2 + ingress + 2–3 avsnitt brødtekst.**
4. **Hovedbilde**: avdekkes med en horisontal clip-path-wipe fra venstre (som en perrongdør som åpnes), bildet selv skaleres 1.04 → 1.0 samtidig. Bildetekst og kreditering under.
5. **Faktarute** (valgfri): 2–4 nøkkeltall i Plex Mono (f.eks. «Linjelengde», «Antall vogner»), teller opp når synlig.
6. **Lenke**: «Les mer om epoken →» til `/epoker/[slug]/`.

Oppsett veksler: bilde høyre / tekst venstre, deretter omvendt. På mobil alltid tekst → bilde.

### 5.3 Sporlinje og fremdrift
- Desktop: SVG-linje i venstre marg, 2 px, `--c-skinne` (i tunnelseksjoner `--c-skinne-mork`). Den delen som er passert fylles med `--c-trikkebla`.
- Signal ved hver stasjon: tre små sirkler (8 px) i et smalt, mørkt hus. Rødt tent før seksjonen er 40 % inne i viewport, deretter grønt. Overgang 180 ms, rød slukker før grønn tennes (80 ms mørkt imellom) — slik et ekte signal skifter.
- Trikkemerket følger scrollposisjonen langs linjen (ScrollTrigger `scrub: 0.6`).
- Mobil: 3 px fremdriftslinje helt øverst under navigasjonen + et lite stasjonsskilt som viser gjeldende epoke og år, oppdateres når ny stasjon passeres.

### 5.4 Tunnelovergangen (1966)
Når T-bane-stasjonen kommer inn, animeres bakgrunnen fra `--c-perrong` til `--c-tunnel` over en scroll-distanse på 60vh (scrub). Tekstfarger byttes samtidig. Første T-bane-bilde vises med en rask «tunnellys»-effekt: en smal lys horisontal stripe feier én gang over bildet (maskert gradient, 700 ms). Tilsvarende overgang tilbake til lys ved Ringen (2006).

### 5.5 Materiell-stripe (på forsiden, etter epokene)
Horisontalt scrollende rad (pinnet seksjon på desktop, vanlig sveip på mobil) med vogntyper i kronologisk rekkefølge. Hvert kort: foto, typebetegnelse i Plex Mono, årstall i drift, én setning. Hover på desktop: kortet løftes 4 px + `--shadow-lift`.

### 5.6 Avslutning
Stor serif-setning om framtiden, en rolig tidslinje-oppsummering (alle stasjonene som små prikker på én horisontal linje, klikkbare), og lenker til Nettverket og Kilder.

---

## 6. Undersider

### 6.1 `/nettverket/` — nettverkskart over tid (signaturfunksjon)
- Skjematisk SVG-kart (ikke geografisk nøyaktig), 45°/90°-vinkler, i stil med et linjekart.
- Data i `src/data/nettverk.json`: hvert strekningssegment har `id`, `type` ("hest" | "trikk" | "forstadsbane" | "tbane"), `apnet` (år), `nedlagt` (år | null), `path` (SVG-path) og `navn`.
- Årstallsglidebryter (1875 → inneværende år) + avspillingsknapp som kjører gjennom årene (1 år per 120 ms).
- Segmenter som åpner tegnes inn med `stroke-dashoffset`; nedlagte blekner til 15 % opasitet med stiplet linje.
- Tekstfelt ved siden av viser hendelser for valgt år (fra epokedata).
- Tastaturstyrt (piltaster flytter året), `aria-live` for året.
- Fase 3 starter med et forenklet kart; eieren kan finjustere `path`-data senere.

### 6.2 `/signal/` — signalanleggets historie
Egen fortelling i samme stasjonsformat: fra tidlig manuell kjøring og enkle signaler, via reléstillverk og ATC, til dagens overgang til CBTC. Innhold leveres av eier (fagperson). Bruk plassholdere til da. Inkluder en liten interaktiv illustrasjon: et signal man kan klikke gjennom (Stopp → Kjør med redusert hastighet → Kjør) med forklaring — kun pedagogisk, generelle signalbilder, merkes «forenklet».

### 6.3 `/epoker/[slug]/`
Stor hero med epokebilde, lengre tekst, bildegalleri (rutenett, klikk åpner lysboks med tastatur- og sveipstøtte), eventuelt **før/etter-glider** (samme sted da og nå; to bilder i samme utsnitt, dra-håndtak), og «Forrige stasjon / Neste stasjon»-navigasjon nederst.

### 6.4 `/kilder/`
Liste over kilder og full bildekreditering (fotograf, år, eier/arkiv, lisens, lenke), generert automatisk fra innholdsfilene.

---

## 7. Innholdsmodell

`src/content/epoker/*.md` — frontmatter (Zod-validert):

```yaml
slug: hestesporveien
rekkefolge: 1
ar: 1875
arSlutt: 1894
tittel: "Hestesporveien"
etikett: "KRISTIANIA 1875"
ingress: "…"
tema: lys            # lys | tunnel
hovedbilde:
  fil: ../../assets/photos/1875-hest-01.jpg
  alt: "…"
  bildetekst: "…"
  fotograf: "…"
  arkiv: "…"
  lisens: "CC BY 4.0"
  kilde: "https://…"
faktaruter:
  - { etikett: "…", verdi: "…" }
galleri: []
forEtter: null
```

Samme bildefelter brukes overalt. Bygget skal **feile** hvis et bilde mangler `alt`, `lisens` eller `kilde`.

### 7.1 Epoker

| # | Slug | År | Tittel | Tema | Stikkord |
|---|---|---|---|---|---|
| 1 | hestesporveien | 1875 | Hestesporveien | lys | Kristiania Sporveisselskab, første linjer med hest |
| 2 | elektrisk-trikk | 1894 | Den elektriske trikken | lys | Kristiania Elektriske Sporvei, tidlig elektrisk sporvei i Norden |
| 3 | forstadsbanene | 1898 | Banene til åsene | lys | Holmenkolbanen og forstadsbanene vestover |
| 4 | oslo-sporveier | 1924 | Byen tar over | lys | Kommunalt eierskap, Oslo Sporveier |
| 5 | forste-tunnel | 1928 | Under byen | lys | Tunnel Majorstuen–Nationaltheatret |
| 6 | etterkrigstid | 1945–1960-tallet | Etterkrigstid og debatten om trikken | lys | Vekst, nedleggelser, planene for T-bane |
| 7 | t-banen | 1966 | T-banen åpner | tunnel | Første T-banestrekning østover |
| 8 | fellestunnelen | 1987–1993 | Øst møter vest | tunnel | Fellestunnelen, sammenkobling øst–vest |
| 9 | ringen | 2006 | Ringen | tunnel → lys | Ringbanen og nytt T-banemateriell |
| 10 | sporveien | 2010-tallet | Sporveien | lys | Organisasjonsendringer, oppgradering av baner |
| 11 | framtiden | i dag → | Neste stasjon | lys | Nye trikker, nytt signalsystem (CBTC), framtidige tunneler |

---

## 8. Kvalitetskrav

- **Ytelse:** Lighthouse mobil ≥ 95 på Ytelse, Tilgjengelighet, Beste praksis, SEO. LCP < 2,0 s på 4G. Hero-bildet `fetchpriority="high"`, alle andre `loading="lazy"`. JS for forsiden < 90 kB gz.
- **Tilgjengelighet:** WCAG 2.1 AA (tilsvarer kravene i norsk regelverk om universell utforming). Kontrast ≥ 4.5:1, synlig fokusmarkering (2 px `--c-trikkebla`, 2 px offset), all animasjon respekterer `prefers-reduced-motion`, alt-tekst på alle bilder, riktig overskriftshierarki, hopp-til-innhold-lenke.
- **Responsivt:** testet på 360, 390 (S24), 768, 1280, 1920 px. Ingen horisontal scroll på `body`.
- **SEO/deling:** unik `<title>` og beskrivelse per side, Open Graph-bilde per epoke (1200 × 630, generert ved bygg), `sitemap.xml`, `lang="nb"`.
- **Personvern:** ingen informasjonskapsler, ingen sporing, ingen tredjepartsforespørsler ved kjøring (fonter selvhostet). Da trengs ingen samtykkebanner.
- **PWA:** manifest (navn «Linjen – Sporveiens historie», tema-farge `#0F1216`), ikoner 192/512 + maskerbar, offline-støtte.
- **Kode:** Prettier + ESLint, ingen `console.log` i produksjon, én animasjonsmodul `src/scripts/motion.ts` som eier all GSAP-oppsett og rydder opp ved navigasjon.

---

## 9. Faser

**Fase 0 – Oppsett.** Astro-prosjekt, avhengigheter fra kapittel 2, mappestruktur, `tokens.css`, fonter, grunnlayout med navigasjon og footer, GitHub Actions for Pages (`site` og `base` konfigurerbare i `astro.config.mjs`). STOPP.

**Fase 1 – Visuell låsing.** Hero (5.1) + sporlinje med signal (5.3) + **én** ferdig stasjon (epoke 1) med plassholderbilde + mobil fremdriftsvisning. Ta Playwright-skjermbilder i 390 × 844 og 1440 × 900 og lagre i `/screenshots/fase-1/`. STOPP og vent på godkjenning av utseendet før noe annet bygges.

**Fase 2 – Hele linjen.** Alle epoker fra innholdsfilene, tunnelovergangene (5.4), materiell-stripen (5.5), avslutning (5.6), epokesidene (6.3). STOPP.

**Fase 3 – Signaturfunksjoner.** `/nettverket/` (6.1), `/signal/` (6.2), før/etter-glider, lysboks. STOPP.

**Fase 4 – Ferdigstilling.** PWA, OG-bilder, `/kilder/`, 404, Lighthouse CI og Playwright-tester, gjennomgang av kvalitetskravene i kapittel 8 med en rapport over hva som er oppfylt. STOPP.

**Fase 5 – (valgfri) engelsk versjon.** Kun hvis eier ber om det: Astro i18n med `/en/`, innhold i egne filer.

---

## 10. Mappestruktur

```
/
├─ CLAUDE.md
├─ astro.config.mjs
├─ src/
│  ├─ assets/photos/        # eiers bilder, navngitt ÅR-emne-NN.jpg
│  ├─ content/epoker/       # én .md per epoke
│  ├─ content/materiell/    # én .md per vogntype
│  ├─ data/nettverk.json
│  ├─ components/           # Hero, Station, TrackLine, Signal, FactBox, Gallery, Lightbox, BeforeAfter, NetworkMap, PhotoPlaceholder, Nav, Footer
│  ├─ layouts/Base.astro
│  ├─ pages/
│  ├─ scripts/motion.ts
│  └─ styles/{tokens.css, base.css, type.css}
├─ public/icons/
├─ screenshots/
└─ .github/workflows/deploy.yml
```

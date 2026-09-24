# Mal: legge inn signalhistorien

Denne malen viser hvordan du fyller ut siden om signalanleggets historie (`/signal/`, engelsk `/en/signalling/`). Siden er bygget som en rekke stasjoner på en sporlinje, i samme format som forsiden, og har et klikkbart signal nederst. Innholdet skal leveres av fagperson (CLAUDE.md 6.2). Alt som mangler, står som `[[TODO: …]]`.

## 1. Kapitlene (stasjonene)

| Fil (norsk)                            | Kapittel       |
| -------------------------------------- | -------------- |
| `src/content/signal/manuell-drift.md`  | Manuell drift  |
| `src/content/signal/enkle-signaler.md` | Enkle signaler |
| `src/content/signal/relestillverk.md`  | Reléstillverk  |
| `src/content/signal/atc.md`            | ATC            |
| `src/content/signal/cbtc.md`           | CBTC           |

- **Engelsk motpart:** Hvert kapittel har en engelsk fil med samme navn under `src/content/en/signal/`.
- **Samsvar:** Bygget stopper hvis et kapittel mangler på ett av språkene (samme `slug` på begge).

## 2. Ett kapittel

```yaml
---
slug: relestillverk # samme på begge språk; må matche filnavnet
rekkefolge: 3 # plass langs linjen
ar: null # null = ingen årstall; sett et år for å vise det stort
arVisning: '1900-tallet' # valgfritt: når året ikke er ett tall
tittel: 'Reléstillverk' # H2 på siden
etikett: 'RELÉSTILLVERK' # brukes ikke synlig på /signal/, men må fylles ut
ingress: 'Én til to setninger som oppsummerer kapitlet.'
tema: lys # alltid lys på /signal/
faktaruter:
  - { etikett: 'Eksempeltall', verdi: '12' } # valgfritt, opptil 4
galleri: [] # vises ikke på /signal/
forEtter: null # vises ikke på /signal/
---
Første avsnitt om kapitlet.

Andre avsnitt. Hele teksten vises på /signal/ – det finnes ingen egen side per kapittel,
så `<!-- mer -->` trengs ikke.
```

> Verdiene over er fiktive og viser bare formatet. Bruk kun kvalitetssikrede opplysninger.

**Merknader til feltene:**

- **`ar`:**
  - Med `ar: null` vises verken stort årstall eller år i stasjonsskiltet. Det passer når et kapittel dekker en utvikling over lang tid.
  - Setter du et årstall, vises det stort uten opptelling. Med `arVisning` kan du vise for eksempel `'1900-tallet'` i skiltet og som hale etter tallet.
- **Tekstlengde:** 2–4 korte avsnitt per kapittel passer formatet.
- **Mellomtitler:** Bruk `###` om teksten trenger dem.
- **Faktaruter:** Tall som starter med et siffer, telles opp når ruten kommer inn i bildet.

## 3. Bilde til et kapittel

Bruk `hovedbilde` nøyaktig som for epokene. Se `docs/bilder-mal.md`.

- **Stier:** `../../assets/photos/…` i norsk fil og `../../../assets/photos/…` i engelsk fil.
- **Uten bilde:** Siden viser plassholderen «Bilde kommer».
- **Galleri og før/etter:** Brukes ikke på `/signal/`.

## 4. Legge til, fjerne eller flytte kapitler

- **Nytt kapittel:** Lag en ny fil på begge språk med ny `slug` og `rekkefolge`. Filnavnet skal være det samme som `slug`, for eksempel `sporfelt.md` med `slug: sporfelt`.
- **Fjerne:** Slett både den norske og den engelske filen.
- **Flytte:** Endre `rekkefolge` på begge språk.
- **Tester:** Kapitlene har ingen egne tester, så slike endringer krever ikke endringer i testene.

## 5. Sidetekstene og det klikkbare signalet

Innledningen øverst på siden og teksten til det klikkbare signalet ligger i ordbøkene `src/i18n/nb.ts` og `src/i18n/en.ts`, under `signal`:

```ts
signal: {
  ingress: 'Innledningen øverst på siden.',
  demoMerke: 'Forenklet – generelle signalbilder',
  demoTittel: 'Prøv et signal',
  demoKnapp: 'Neste signalbilde',
  bilder: [
    { tilstand: 'rod', navn: 'Stopp', forklaring: 'Toget skal stoppe foran signalet.' },
    { tilstand: 'gul', navn: 'Kjør med redusert hastighet', forklaring: '…' },
    { tilstand: 'gronn', navn: 'Kjør', forklaring: '…' },
  ],
},
```

**Signalbildene i demoen:**

- **Hva du kan endre:** `navn` og `forklaring`. Knappen går gjennom signalbildene i rekkefølgen de står i listen.
- **Lampene:** `tilstand` avgjør hvilken lampe som lyser. Mulige verdier er `rod`, `gul` og `gronn`, og signalet har tre lamper i den rekkefølgen, ovenfra og ned.
- **Andre signalbilder:** Trenger Sporveien signalbilder som ikke lar seg vise med én tent lampe av tre, for eksempel to lamper eller blink, krever det en kodeendring. Si fra, så bygger jeg det.
- **Tester:** Testen av signaldemoen leser signalbildene fra siden, så du kan endre antall, rekkefølge og tekster uten å endre testen.
- **Merkingen «Forenklet»:** Skal stå så lenge demoen bruker generelle signalbilder og ikke Sporveiens egne.

**Begge språk:** Endre alltid både `nb.ts` og `en.ts`. TypeScript krever at de har de samme feltene.

## 6. Sjekk før du committer

```bash
npm run check    # fanger manglende felt, feil sti og kapitler som mangler på ett språk
npm run build
npm test         # funksjonstester, inkludert signaldemoen (krever bygget over)
npm run dev      # se /signal/ og /en/signalling/
```

- [ ] Alle fakta er kvalitetssikret av fagperson. Det som mangler, er merket `[[TODO: …]]`.
- [ ] Hvert kapittel finnes både på norsk og engelsk, med samme `slug` og `rekkefolge`.
- [ ] `ar` er `null` eller et kvalitetssikret årstall.
- [ ] Bilder har `alt`, `lisens` og `kilde` på begge språk.
- [ ] Endringer i signalbildene er gjort i både `nb.ts` og `en.ts`, og testen er oppdatert om nødvendig.
- [ ] Kildene står i `src/data/kilder.json`.

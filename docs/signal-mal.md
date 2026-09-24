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

## 3. Skriveråd for kapitteltekstene

Signalhistorien er fagstoff skrevet for et bredt publikum: allmennheten, ansatte og sporveisentusiaster. Målet er at en leser uten fagbakgrunn forstår **hva** systemet gjorde og **hvorfor** det betydde noe, uten at fagfolk synes teksten er unøyaktig.

### Oppbygging av et kapittel

| Del                    | Innhold                                                   | Lengde        |
| ---------------------- | --------------------------------------------------------- | ------------- |
| `ingress`              | Hva systemet er, og hvorfor det var et steg videre        | 1–2 setninger |
| 1. avsnitt             | Hvordan det virket, forklart enkelt                       | 2–4 setninger |
| 2. avsnitt             | Når og hvor det ble tatt i bruk hos Sporveien (med kilde) | 2–4 setninger |
| 3. avsnitt (valgfritt) | Hva det førte til, og overgangen til neste kapittel       | 1–3 setninger |

Til sammen ca. 80–150 ord per kapittel. Trengs mer, kan teksten deles med `###`-mellomtitler.

### Fagbegreper og forkortelser

- **Forklar hvert fagbegrep første gang det brukes**, med en kort bisetning eller parentes. For eksempel «reléstillverk ([kort forklaring])».
- **Skriv ut forkortelser første gang** i hvert kapittel, for eksempel «[forkortelse] ([fullt navn])». Etterpå holder forkortelsen.
- **Ett begrep for én ting.** Har du valgt «signalbilde», så bruk ikke også «signalvisning» i samme tekst.
- **Unngå intern sjargong** og interne navn på anlegg, rom eller systemer som publikum ikke kjenner.

### Språk og tone

- Presist og nøkternt. Bruk aktive setninger: «Stillverket styrte …», ikke «Det ble styrt av …».
- Én idé per avsnitt, og korte setninger.
- Konkret framfor generelt. Et eksempel fra en bestemt strekning (med kilde) forklarer bedre enn en generell beskrivelse.
- Ingen vurderende ord som «revolusjonerende» eller «banebrytende» uten at kilden sier det.

### Fakta og sikkerhet

- Alle årstall, steder og tekniske opplysninger skal være kvalitetssikret av fagperson og stå i `src/data/kilder.json` (CLAUDE.md regel 3). Det som mangler, merkes `[[TODO: …]]`.
- **Ikke publiser sikkerhetsfølsomme detaljer** om dagens anlegg, for eksempel interne prosedyrer, svakheter eller detaljer som kan misbrukes. Beskriv prinsipper og historie, ikke oppskrifter.
- Er noe forenklet i teksten, bør det være tydelig for leseren, for eksempel «forenklet sagt …».

### Engelsk versjon

- Bruk etablerte engelske fagtermer, for eksempel _interlocking_, _signal aspect_ og _train protection_. Skriv ut forkortelsene første gang, som på norsk.
- Skriv naturlig britisk engelsk (_signalling_, _metres_), og oversett innholdet i stedet for ord for ord.
- Egennavn som Sporveien, Oslo Sporveier og stasjonsnavn beholdes.

## 4. Bilde til et kapittel

Bruk `hovedbilde` nøyaktig som for epokene. Se `docs/bilder-mal.md`.

- **Stier:** `../../assets/photos/…` i norsk fil og `../../../assets/photos/…` i engelsk fil.
- **Uten bilde:** Siden viser plassholderen «Bilde kommer».
- **Galleri og før/etter:** Brukes ikke på `/signal/`.

## 5. Legge til, fjerne eller flytte kapitler

- **Nytt kapittel:** Lag en ny fil på begge språk med ny `slug` og `rekkefolge`. Filnavnet skal være det samme som `slug`, for eksempel `sporfelt.md` med `slug: sporfelt`.
- **Fjerne:** Slett både den norske og den engelske filen.
- **Flytte:** Endre `rekkefolge` på begge språk.
- **Tester:** Kapitlene har ingen egne tester, så slike endringer krever ikke endringer i testene.

## 6. Sidetekstene og det klikkbare signalet

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

**Skriveråd for signalbildene i demoen:**

- **`navn`:** Signalbildets navn slik det brukes i faget, med stor forbokstav og uten punktum, for eksempel «Stopp».
- **`forklaring`:** Én kort setning om hva føreren skal gjøre, opptil ca. 80 tegn og med punktum. Skriv den fra førerens side: «Toget skal …» eller «Toget kan …».
- **Rekkefølge:** Fra det mest restriktive til det minst restriktive, slik at knappen «går opp» gjennom signalbildene.
- **Sporveiens egne signalbilder:** Går du over til dem, kan merkingen «Forenklet» fjernes. Da må navn og forklaringer følge Sporveiens regelverk ordrett.

**Begge språk:** Endre alltid både `nb.ts` og `en.ts`. TypeScript krever at de har de samme feltene.

## 7. Sjekk før du committer

```bash
npm run check    # fanger manglende felt, feil sti og kapitler som mangler på ett språk
npm run build
npm test         # funksjonstester, inkludert signaldemoen (krever bygget over)
npm run dev      # se /signal/ og /en/signalling/
```

- [ ] Alle fakta er kvalitetssikret av fagperson. Det som mangler, er merket `[[TODO: …]]`.
- [ ] Fagbegreper og forkortelser er forklart første gang de brukes, på begge språk.
- [ ] Teksten inneholder ingen sikkerhetsfølsomme detaljer om dagens anlegg.
- [ ] Hvert kapittel finnes både på norsk og engelsk, med samme `slug` og `rekkefolge`.
- [ ] `ar` er `null` eller et kvalitetssikret årstall.
- [ ] Bilder har `alt`, `lisens` og `kilde` på begge språk.
- [ ] Endringer i signalbildene er gjort i både `nb.ts` og `en.ts`.
- [ ] Kildene står i `src/data/kilder.json`.

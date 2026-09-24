# Mal: legge inn sidetekster

Sidetekster er de faste tekstene på sidene som ikke hører til en bestemt epoke, et kapittel eller en vogntype:

- toppseksjonen på forsiden
- sidetitler og beskrivelser for søkemotorer
- innledninger på undersidene
- avslutningen
- menyen og footeren
- «Om»-siden og 404-siden

Epoketekster, signalhistorien, materiell og kilder har egne maler.

## 1. Filene

| Språk   | Fil              |
| ------- | ---------------- |
| Norsk   | `src/i18n/nb.ts` |
| Engelsk | `src/i18n/en.ts` |

Begge filene har nøyaktig de samme feltene, og TypeScript kontrollerer at ingenting mangler. En tekst endres ved at du bytter ut teksten mellom anførselstegnene, i begge filene:

```ts
om: {
  todo: '[[TODO: hvem som står bak nettstedet …]]',   // ← bytt ut teksten
},
```

- **Feltnavnene:** Ikke endre navnet foran kolon (`todo:`). Koden bruker navnet til å finne teksten.
- **Anførselstegn og apostrof:** Tekstene står i enkle anførselstegn `'…'`. Bruk typografisk apostrof i engelsk (`today’s`), eller skriv `\'`.
- **Linjeskift:** Lange tekster kan deles over flere linjer slik Prettier gjør det. Innholdet blir det samme.

## 2. Hvor tekstene vises

### Forsiden

| Felt                  | Vises                                                                             | Råd                                           |
| --------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| `forside.etikett`     | Liten etikett over overskriften i toppseksjonen, og på delingsbildet              | Kort, for eksempel `Sporveien · 1875 – i dag` |
| `forside.h1`          | Hovedoverskriften i toppseksjonen, og på delingsbildet                            | Opptil ca. 30 tegn                            |
| `forside.ingress`     | Teksten under overskriften                                                        | 1–2 setninger                                 |
| `forside.beskrivelse` | Beskrivelse for søkemotorer og ved deling                                         | 120–160 tegn                                  |
| `forside.scroll`      | «Scroll for å kjøre» nederst i toppseksjonen                                      | 2–4 ord                                       |
| `forside.tittel`      | **Ikke endre.** Må være `Linjen`, fordi koden bruker den til å lage sidetittelen. |                                               |
| `avslutning.*`        | Avslutningen nederst på forsiden: etikett, den store setningen og lenketekster    | Setningen: én setning                         |

> Teksten i toppseksjonen (etikett, H1 og ingress) er bestemt i CLAUDE.md 5.1. Endrer du den, avviker nettstedet fra spesifikasjonen.

### Undersidene

Hver underside har de samme feltene: `sideTittel` (H1 og fanetittel), `sideBeskrivelse` (søkemotorer), `etikett` (over H1) og `ingress` (under H1).

| Side       | Felt i ordboken                                                   |
| ---------- | ----------------------------------------------------------------- |
| Nettverket | `nettverk.*`, også knapper, hint, forklaring og linjetyper        |
| Signal     | `signal.*`, også teksten i signaldemoen (se `docs/signal-mal.md`) |
| Materiell  | `materiell.*`, også overskriften på materiell-stripen på forsiden |
| Kilder     | `kilder.*`, også kolonnenavn og meldinger når listen er tom       |
| Om         | `om.*`, se punkt 3                                                |
| 404        | `feil.*`. Siden viser både norsk og engelsk tekst.                |

### Felles for alle sider

| Felt                      | Vises                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| `meta.nettstedNavn`       | Fanetittel på forsiden og navnet ved deling                          |
| `meta.hoppTilInnhold`     | Lenken «Hopp til innhold» for tastaturbrukere                        |
| `nav.*`                   | Menyen, knappen for mobilmeny og språkvelgeren                       |
| `bunn.*`                  | Footeren. `bunn.undertittel` står også på delingsbildene.            |
| `felles.*`                | «Bilde kommer», «Les mer om epoken» og `[[TODO]]`-tekster for bilder |
| `epoke.*`                 | Overskrifter og navigasjon på epokesidene                            |
| `lysboks.*`, `forEtter.*` | Knapper og skjermlesertekster for bildevisning og glider             |

**Ikke endre:** `meta.ogLocale` (`nb_NO` / `en_GB`) og `nav.annetSprakKort` (`EN` / `NB`). De er tekniske verdier.

## 3. «Om»-siden

| Felt                                                | Innhold                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `om.ingress`                                        | Innledning under overskriften                                                                                            |
| `om.todo`                                           | Avsnittet om hvem som står bak og hvordan innholdet er laget. Erstatt `[[TODO]]`-teksten her.                            |
| `om.personvern`, `om.personvernTekst`               | Personvernavsnittet. Skal fortsatt være sant: ingen informasjonskapsler, ingen sporing og ingen tredjepartsforespørsler. |
| `om.kilderTittel`, `om.kilderFor`, `om.kilderLenke` | Avsnittet som lenker til kildesiden                                                                                      |

`om.todo` er ett avsnitt. Trenger du flere avsnitt eller mellomtitler på «Om»-siden, krever det en liten kodeendring. Si fra, så bygger jeg det.

## 4. Lengde og stil

| Type                       | Råd                                                             |
| -------------------------- | --------------------------------------------------------------- |
| `sideTittel`               | 1–3 ord. Fanetittelen blir «Tittel · Linjen».                   |
| `sideBeskrivelse`          | 120–160 tegn, én eller to hele setninger                        |
| `etikett`                  | 2–4 ord. Vises med store bokstaver automatisk, så skriv vanlig. |
| `ingress`                  | 1–2 setninger                                                   |
| Knapper og korte etiketter | Så kort som mulig. Sjekk at de får plass på mobil.              |

- Skriv norsk bokmål og britisk engelsk, med vanlig setningsstil.
- Ikke sett inn historiske påstander i sidetekstene. Fakta hører hjemme i epoketekstene, med kilde (CLAUDE.md regel 3).

## 5. Etter endring

- **Delingsbildene** (`forside.etikett`, `forside.h1` og `bunn.undertittel`) lages på nytt ved `npm run build`. Sjekk at teksten får plass i `dist/og/forside.png` og `en-forside.png`.
- **Testene** leser tekstene fra ordbøkene, så de trenger ingen endring.

## 6. Sjekk før du committer

```bash
npm run check    # TypeScript: fanger felt som mangler i nb.ts eller en.ts
npm run build
npm test
npm run dev      # se sidene på nb og en, mobil og desktop
```

- [ ] Endringen er gjort i både `nb.ts` og `en.ts`.
- [ ] Ingen feltnavn er endret, og `forside.tittel` er fortsatt `Linjen`.
- [ ] Beskrivelsene er 120–160 tegn.
- [ ] Knapper og etiketter får plass på mobil (390 px).
- [ ] Delingsbildet for forsiden ser riktig ut etter bygget.

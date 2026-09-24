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

## 5. Engelske sidetekster

De engelske sidetekstene står i `src/i18n/en.ts`, med de samme feltene som i `nb.ts`. De skal si det samme som den norske teksten, men være skrevet som naturlig engelsk.

### Grunnregler

- **Britisk engelsk** (en-GB), fordi nettstedet er merket `en_GB`: _signalling_, _metres_, _colour_, _organisation_, _programme_.
- **Oversett innholdet, ikke ordene.** Skriv setningen slik en engelsk redaktør ville skrevet den. Det er helt i orden at setningsbygningen blir annerledes enn på norsk.
- **Ingen nye opplysninger.** Den engelske teksten skal ikke inneholde fakta som ikke står i den norske. Står det `[[TODO: …]]` på norsk, skal det stå `[[TODO: …]]` på engelsk også, gjerne med beskrivelsen oversatt.
- **Setningsstil i titler og knapper:** «Watch the network grow», ikke «Watch The Network Grow».
- **Samme tone som på norsk:** presis og nøktern, uten markedsføringsspråk.

### Ordliste

Bruk de samme engelske ordene overalt, også i epoketekstene, signalhistorien og nettverksnavnene. Listen viser ordene nettstedet allerede bruker:

| Norsk                     | Engelsk                           | Merknad                                       |
| ------------------------- | --------------------------------- | --------------------------------------------- |
| epoke                     | era                               | Menyen: _Eras_                                |
| stasjon                   | station                           | _Previous station_ / _Next station_           |
| materiell                 | rolling stock                     | Menyen: _Rolling stock_                       |
| vogn / vogntype           | car / vehicle type                |                                               |
| nettverket                | the network                       | Menyen: _Network_                             |
| signal (anlegget)         | signalling                        | Menyen: _Signalling_                          |
| signalbilde               | signal aspect                     | Demoen: _Next aspect_                         |
| stillverk / reléstillverk | interlocking / relay interlocking |                                               |
| hestesporvei              | horse tramway                     |                                               |
| trikk                     | tram                              |                                               |
| forstadsbane              | suburban railway                  |                                               |
| T-bane                    | metro (T-bane)                    | _Metro_ alene når det er tydelig              |
| linje / strekning         | line / route                      | _lines in service_                            |
| nedlagt                   | closed                            |                                               |
| kilder                    | sources                           | Menyen: _Sources_                             |
| bildekreditering          | image credits                     |                                               |
| forenklet                 | simplified                        | Demoen: _Simplified – generic signal aspects_ |
| i dag                     | today                             | _1875 – today_, _Today →_                     |

**Oversettes ikke:** Sporveien, Oslo Sporveier, Kristiania Sporveisselskab, Kristiania Elektriske Sporvei, Kristiania, Holmenkolbanen, Fellestunnelen, Ringbanen, stasjonsnavn og typebetegnelser. Egennavn med en etablert engelsk forklaring kan få den første gang i en tekst, for eksempel «Fellestunnelen (the common tunnel)».

### Typografi

| Norsk                      | Engelsk                                           |
| -------------------------- | ------------------------------------------------- |
| «sitat»                    | “quote”, og ‘quote’ inne i et sitat               |
| apostrof `'`               | typografisk `’` (_today’s_), eller `\'` i `en.ts` |
| 1945–1960-tallet           | 1945–1960s                                        |
| 2010-tallet                | 2010s                                             |
| 1 200 (mellomrom)          | 1,200 (komma)                                     |
| 8,5 km                     | 8.5 km                                            |
| tankestrek – med mellomrom | en dash – med mellomrom, likt som på norsk        |

### Lengde

Engelsk blir ofte litt kortere enn norsk, men ikke alltid. Sjekk særlig knapper, menyen og etiketter på mobil (390 px), og at `forside.h1` og `forside.etikett` får plass på delingsbildet `dist/og/en-forside.png`.

### Ikke endre

- `meta.ogLocale` (`en_GB`), `nav.annetSprakKort` (`NB`) og `nav.annetSprakNavn` (`Norsk`). Språkvelgeren viser disse når siden er på engelsk.
- `forside.tittel`, som skal være `Linjen` også på engelsk.

## 6. Etter endring

- **Delingsbildene** (`forside.etikett`, `forside.h1` og `bunn.undertittel`) lages på nytt ved `npm run build`. Sjekk at teksten får plass i `dist/og/forside.png` og `en-forside.png`.
- **Testene** leser tekstene fra ordbøkene, så de trenger ingen endring.

## 7. Sjekk før du committer

```bash
npm run check    # TypeScript: fanger felt som mangler i nb.ts eller en.ts
npm run build
npm test
npm run dev      # se sidene på nb og en, mobil og desktop
```

- [ ] Endringen er gjort i både `nb.ts` og `en.ts`.
- [ ] Den engelske teksten er britisk engelsk, følger ordlisten og har ingen opplysninger som ikke står på norsk.
- [ ] Ingen feltnavn er endret, og `forside.tittel` er fortsatt `Linjen`.
- [ ] Beskrivelsene er 120–160 tegn.
- [ ] Knapper og etiketter får plass på mobil (390 px).
- [ ] Delingsbildet for forsiden ser riktig ut etter bygget.

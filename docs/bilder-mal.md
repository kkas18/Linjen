# Mal: legge inn bilder

Slik legger du inn bilder i Linjen. Bygget stopper hvis et bilde mangler `alt`, `lisens` eller `kilde`, eller hvis filen ikke finnes. Kreditering til `/kilder/` lages automatisk fra feltene under.

## 1. Legg bildefilen i `src/assets/photos/`

- **Navn:** `ÅR-emne-NN.jpg`, med små bokstaver, uten æøå og uten mellomrom.
  Eksempel: `1875-hest-01.jpg`, `1966-tbane-02.jpg`, `2006-ringen-01.jpg`.
- **Format:** JPEG eller PNG. Nettstedet lager AVIF og WebP selv.
- **Størrelse:** Last opp originalen i best mulig kvalitet.
  - hovedbilde og galleri: minst 1600 px bred
  - forsidebildet (hero): minst 2400 px bred
  - før/etter: to bilder med samme utsnitt og samme størrelse
- **Farge:** Alle foto vises i svart-hvitt på nettstedet. Last opp originalen, og ikke fargelegg historiske foto.

## 2. Bildefeltene

Hvert bilde har de samme feltene, uansett hvor det brukes:

| Felt         | Påkrevd | Innhold                                                                    |
| ------------ | ------- | -------------------------------------------------------------------------- |
| `fil`        | ja      | Sti til filen, relativt til innholdsfilen (se tabellen i punkt 4)          |
| `alt`        | ja      | Hva bildet viser, for skjermlesere. Én setning, ikke «Bilde av …».         |
| `lisens`     | ja      | For eksempel `CC BY 4.0`, `CC BY-SA 4.0`, `Falt i det fri (public domain)` |
| `kilde`      | ja      | Full URL til bildet hos arkivet (`https://…`)                              |
| `bildetekst` | nei     | Teksten som vises under bildet                                             |
| `fotograf`   | nei     | Navn, eller `Ukjent`                                                       |
| `ar`         | nei     | Fotoår som tall, for eksempel `1928`                                       |
| `arkiv`      | nei     | Eier eller arkiv, for eksempel `Oslo byarkiv`                              |

## 3. Kopier inn der bildet skal brukes

### Epoke: hovedbilde, galleri og før/etter

Fil: `src/content/epoker/<slug>.md`

```yaml
hovedbilde:
  fil: ../../assets/photos/1875-hest-01.jpg
  alt: 'Hestetrukket sporvogn på skinner i en gate med trehus'
  bildetekst: 'Hestesporvogn i Kristiania.'
  fotograf: 'Ukjent'
  ar: 1880
  arkiv: 'Oslo byarkiv'
  lisens: 'CC BY 4.0'
  kilde: 'https://…'
galleri:
  - fil: ../../assets/photos/1875-hest-02.jpg
    alt: '…'
    bildetekst: '…'
    fotograf: '…'
    ar: 1885
    arkiv: '…'
    lisens: 'CC BY 4.0'
    kilde: 'https://…'
  - fil: ../../assets/photos/1875-hest-03.jpg
    alt: '…'
    lisens: 'CC BY 4.0'
    kilde: 'https://…'
forEtter:
  sted: 'Karl Johans gate, sett mot Slottet'
  for:
    fil: ../../assets/photos/1890-karljohan-01.jpg
    alt: '…'
    ar: 1890
    lisens: 'CC BY 4.0'
    kilde: 'https://…'
  etter:
    fil: ../../assets/photos/2025-karljohan-01.jpg
    alt: '…'
    ar: 2025
    lisens: 'CC BY 4.0'
    kilde: 'https://…'
```

- Står det `galleri: []` eller `forEtter: null` fra før, erstatter du hele linjen med blokken over.
- Galleriet kan ha så mange bilder du vil.

### Signalhistorien

Fil: `src/content/signal/<slug>.md`. Bruk `hovedbilde` på samme måte som over.

### Materiell

Fil: `src/content/materiell/materiell-NN.md`

```yaml
bilde:
  fil: ../../assets/photos/1966-t1000-01.jpg
  alt: '…'
  bildetekst: '…'
  fotograf: '…'
  ar: 1966
  arkiv: '…'
  lisens: 'CC BY 4.0'
  kilde: 'https://…'
```

## 4. Husk den engelske versjonen

Hver norsk fil har en engelsk motpart under `src/content/en/…` med samme filnavn. Bildene må legges inn der også.

- `fil`, `fotograf`, `ar`, `arkiv`, `lisens` og `kilde` er de samme som i den norske filen.
- `alt`, `bildetekst` og `sted` skrives på engelsk.
- Stien har ett `../` ekstra fordi filen ligger én mappe dypere:

| Innholdsfil                                                | Sti til bildet                   |
| ---------------------------------------------------------- | -------------------------------- |
| `src/content/epoker/…`                                     | `../../assets/photos/fil.jpg`    |
| `src/content/signal/…`                                     | `../../assets/photos/fil.jpg`    |
| `src/content/materiell/…`                                  | `../../assets/photos/fil.jpg`    |
| `src/content/en/epoker/…` (og `en/signal`, `en/materiell`) | `../../../assets/photos/fil.jpg` |

## 5. Sjekk før du committer

```bash
npm run check   # fanger manglende felt og feil sti
npm run build   # bygger og lager OG-bilder
```

- [ ] Filen ligger i `src/assets/photos/` og følger navneregelen
- [ ] `alt`, `lisens` og `kilde` er fylt ut, både på norsk og engelsk
- [ ] Lisensen tillater publisering, og krediteringen er slik arkivet krever
- [ ] Bildet står både i den norske og den engelske filen
- [ ] `[[TODO: hovedbilde …]]`-teksten er borte fra siden

## Forsidebildet (hero)

Forsidebildet har foreløpig ikke noe eget felt i innholdsfilene, så det krever en liten kodeendring. Si fra når du har et arkivfoto, så kobler jeg det til. Det lastes med `fetchpriority="high"` for rask visning.

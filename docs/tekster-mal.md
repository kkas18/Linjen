# Mal: legge inn tekster

Denne malen viser hvor tekstene i Linjen ligger og hvordan de fylles ut. Alle innholdsfiler kontrolleres ved bygg, så en fil som mangler et påkrevd felt, stopper bygget. Bilder har en egen mal i `docs/bilder-mal.md`.

## Grunnregler

1. **Bare kvalitetssikrede fakta.** Nettstedet skal ikke inneholde historie som ikke er kontrollert (CLAUDE.md regel 3). Mangler en opplysning, skriver du `[[TODO: hva som mangler]]` der den skal stå, og merket blir stående synlig til det er fylt ut.
2. **Begge språk.** Hver norsk fil har en engelsk motpart med samme filnavn under `src/content/en/…`. Bygget stopper hvis en epoke eller et signalkapittel mangler på det ene språket. Det norske innholdet er fasit, og det engelske oversettes fra det.
3. **Språk og skrivemåte.** Norsk bokmål, britisk engelsk og vanlig setningsstil. Bruk tankestrek (–) og «sitattegn» på norsk, “quotes” på engelsk.
4. **Anførselstegn i YAML.** Tekstverdier står i enkle anførselstegn: `'…'`. Står det en apostrof inne i teksten, skriver du den dobbelt: `'Oslo''s …'`. Du kan også bruke typografisk apostrof: `'Oslo’s …'`.

## 1. Epoker (forsiden og epokesidene)

**Filer:** `src/content/epoker/<slug>.md` og `src/content/en/epoker/<slug>.md`.

### Frontmatter

Tall i eksemplet er fiktive og viser bare formatet.

```yaml
---
slug: hestesporveien # samme på begge språk, bare små bokstaver og bindestrek
rekkefolge: 1 # plass langs linjen
ar: 1875 # tallet det telles opp til; null for «I dag»
arSlutt: 1894 # valgfritt
arVisning: '1945–1960-tallet' # valgfritt: når året ikke er ett tall
tittel: 'Hestesporveien' # H2 på forsiden, H1 på epokesiden
etikett: 'KRISTIANIA 1875' # kort stikkord over tittelen på epokesiden
ingress: 'Én til to setninger som oppsummerer epoken.'
tema: lys # lys | tunnel (tunnel gir mørk bakgrunn)
faktaruter:
  - { etikett: 'Linjelengde', verdi: '12,5 km' } # fiktivt eksempel
  - { etikett: 'Antall vogner', verdi: '[[TODO: antall vogner]]' }
galleri: [] # bilder: se docs/bilder-mal.md
forEtter: null
---
```

**Faktaruter**

- Opptil fire ruter per epoke.
- En verdi som starter med et tall, telles opp når ruten kommer inn i bildet. Resten av teksten blir stående som den er, for eksempel `km`.
- Verdier med bare tekst vises uten opptelling.
- Har du ingen tall ennå, skriver du `faktaruter: []`.

### Brødtekst

```markdown
Første avsnitt. Vises på forsiden og på epokesiden.

Andre avsnitt. Vises også begge steder.

<!-- mer -->

Alt etter markøren vises bare på epokesiden («Les mer om epoken»).
Her kan teksten være lengre, med flere avsnitt.
```

- **Før `<!-- mer -->`:** 2–3 korte avsnitt (spesifikasjon 5.2). Dette er teksten på forsiden.
- **Etter markøren:** den lengre fortellingen, som bare vises på epokesiden.
- **Overskrifter:** Bruk `###` om teksten trenger mellomtitler, siden sidetittelen allerede bruker H1/H2.

**Anbefalt lengde**

| Felt                | Lengde                             |
| ------------------- | ---------------------------------- |
| `tittel`            | Opptil ca. 40 tegn                 |
| `etikett`           | Opptil ca. 30 tegn                 |
| `ingress`           | 1–2 setninger, opptil ca. 180 tegn |
| Brødtekst før `mer` | 2–3 avsnitt, ca. 60–120 ord        |

## 2. Signalhistorien (`/signal/`)

**Filer:** `src/content/signal/<slug>.md` og `src/content/en/signal/<slug>.md`.

- Samme felt som for epoker.
- `ar: null` skjuler det store årstallet. Setter du et årstall der, vises det.
- `tema` er alltid `lys`.
- Det finnes ikke noen egen side per kapittel, så `<!-- mer -->` trengs ikke. Hele teksten vises på `/signal/`.

## 3. Materiell (vogner og tog)

**Filer:** `src/content/materiell/materiell-NN.md` og `src/content/en/materiell/materiell-NN.md`.

```yaml
---
rekkefolge: 1 # kronologisk rekkefølge
type: 'T1000' # typebetegnelse (vises i Plex Mono)
iDrift: '1966–2006' # år i drift
setning: 'Én setning om vogntypen.'
---
```

- **Ny vogntype:** kopier en fil og gi den neste nummer.
- **Fjerne en vogntype:** slett både den norske og den engelske filen.

## 4. Kildeliste (`/kilder/`)

**Fil:** `src/data/kilder.json`. Kildelisten er felles for begge språk, fordi kildehenvisninger ikke oversettes.

```json
[
  {
    "forfatter": "Etternavn, Fornavn",
    "tittel": "Bokens eller artikkelens tittel",
    "utgitt": 1975,
    "utgiver": "Forlag eller arkiv",
    "lenke": "https://…"
  }
]
```

- **Påkrevd:** bare `tittel`. De andre feltene kan utelates.
- **`lenke`:** må være en full URL.
- **Rekkefølge:** kildene vises i den rekkefølgen de står i filen.

## 5. Nettverkskartet (`/nettverket/`)

**Filer:** `src/data/nettverk.json` (data og norske navn) og `src/data/nettverk.en.json` (engelske navn per `id`).

```json
{
  "id": "holmenkolbanen",
  "type": "forstadsbane",
  "apnet": 1898,
  "nedlagt": null,
  "navn": "Holmenkolbanen",
  "path": "M 240 240 H 160 L 100 180 V 80"
}
```

- **`type`:** `hest`, `trikk`, `forstadsbane` eller `tbane`.
- **`nedlagt`:** et årstall, eller `null` hvis strekningen fortsatt er i drift. Nedlagte strekninger vises stiplet og blekt.
- **`path`:** SVG-kommandoene `M`, `L`, `H` og `V`, i et koordinatsystem på 760 × 480. Hold deg til 45°- og 90°-vinkler.
- **Engelske navn:** Hver `id` må også ha et engelsk navn i `nettverk.en.json`, ellers stopper bygget.

## 6. Faste tekster i grensesnittet

Knapper, menyer, sidetitler og siden «Om» ligger i to ordbøker:

- `src/i18n/nb.ts` (norsk)
- `src/i18n/en.ts` (engelsk)

Eksempel på teksten om hvem som står bak nettstedet (under `om`):

```ts
todo: '[[TODO: hvem som står bak nettstedet, og hvordan innholdet er laget og kvalitetssikret.]]',
```

- Bytt ut teksten mellom anførselstegnene, både i `nb.ts` og `en.ts`.
- Ikke endre navnet foran kolon. TypeScript krever at begge filene har de samme feltene.

## 7. Sjekk før du committer

```bash
npm run check    # fanger manglende felt og feil i skjemaene
npm run build    # bygger og lager delingsbilder (OG) med nye titler
npm test         # funksjonstester (krever bygget over)
```

- [ ] Alle fakta er kvalitetssikret. Det som mangler, er merket `[[TODO: …]]`.
- [ ] Teksten finnes både i den norske og den engelske filen.
- [ ] `<!-- mer -->` står etter 2–3 avsnitt i epoketekstene.
- [ ] Tittel og ingress holder seg innenfor anbefalt lengde.
- [ ] Kildene teksten bygger på, står i `src/data/kilder.json`.
- [ ] Du har sett over resultatet med `npm run dev`, på både mobil og desktop.

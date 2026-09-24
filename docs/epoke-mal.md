# Mal: legge inn epoketekster

Denne malen viser hvordan du skriver og legger inn tekstene for epokene, altså stasjonene langs linjen. Hver epoke vises to steder:

- **Forsiden** (`/`): som en stasjon med skilt, stort årstall, tittel, ingress, en kort tekst, bilde og faktarute.
- **Epokesiden** (`/epoker/<slug>/`): med stor toppseksjon, hele teksten, galleri, før/etter-glider og lenker til forrige og neste stasjon.

Engelsk versjon ligger på `/en/` og `/en/eras/<slug>/`.

## 1. De elleve epokene

| #   | Fil (`src/content/epoker/…`) | År (`ar` / `arVisning`)   | Tema     |
| --- | ---------------------------- | ------------------------- | -------- |
| 1   | `hestesporveien.md`          | 1875                      | `lys`    |
| 2   | `elektrisk-trikk.md`         | 1894                      | `lys`    |
| 3   | `forstadsbanene.md`          | 1898                      | `lys`    |
| 4   | `oslo-sporveier.md`          | 1924                      | `lys`    |
| 5   | `forste-tunnel.md`           | 1928                      | `lys`    |
| 6   | `etterkrigstid.md`           | 1945 / «1945–1960-tallet» | `lys`    |
| 7   | `t-banen.md`                 | 1966                      | `tunnel` |
| 8   | `fellestunnelen.md`          | 1987 / «1987–1993»        | `tunnel` |
| 9   | `ringen.md`                  | 2006                      | `tunnel` |
| 10  | `sporveien.md`               | 2010 / «2010-tallet»      | `lys`    |
| 11  | `framtiden.md`               | `null` / «I dag →»        | `lys`    |

- **Engelsk motpart:** Hver fil har en engelsk motpart med samme navn under `src/content/en/epoker/`. Bygget stopper hvis en epoke mangler på ett av språkene.
- **`slug`:** Er adressen til epokesiden. Ikke endre `slug` på en epoke som finnes, for da brytes lenker og delinger.

## 2. Frontmatter: feltene og hvor de vises

```yaml
---
slug: eksempel-epoke
rekkefolge: 12
ar: 1900
arSlutt: 1950
arVisning: '1900–1950'
tittel: 'Eksempelepoke'
etikett: 'EKSEMPEL 1900'
ingress: 'Én til to setninger som oppsummerer epoken.'
tema: lys
faktaruter:
  - { etikett: 'Eksempeltall', verdi: '12 km' }
galleri: []
forEtter: null
---
```

> Verdiene er fiktive og viser bare formatet. Bruk kun kvalitetssikrede opplysninger (CLAUDE.md regel 3).

| Felt         | Påkrevd | Vises                                                                                                        | Råd                                           |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `slug`       | ja      | I adressen (`/epoker/<slug>/`). Samme på begge språk.                                                        | Små bokstaver og bindestrek                   |
| `rekkefolge` | ja      | Rekkefølgen langs linjen, i tidslinjen og for forrige/neste                                                  | Samme på begge språk                          |
| `ar`         | ja      | Stort årstall på forsiden. Telles opp fra forrige epokes år. Brukes også på nettverkskartet og i tidslinjen. | Tall, eller `null` for «i dag»                |
| `arVisning`  | nei     | Stasjonsskiltet og hale etter årstallet, for eksempel `1945` + «–1960-tallet»                                | Brukes når året ikke er ett tall              |
| `arSlutt`    | nei     | Vises ikke i dag                                                                                             | Årstall                                       |
| `tittel`     | ja      | Stasjonsskilt, H2 på forsiden, H1 og sidetittel på epokesiden, delingsbilde (OG), nettverkskartet            | Opptil ca. 40 tegn                            |
| `etikett`    | ja      | Over tittelen på epokesiden og på delingsbildet                                                              | Kort, med store bokstaver, opptil ca. 30 tegn |
| `ingress`    | ja      | Under tittelen begge steder, som beskrivelse for søkemotorer og på nettverkskartet                           | 1–2 setninger, opptil ca. 180 tegn            |
| `tema`       | ja      | `lys` eller `tunnel`. Se punkt 5.                                                                            |                                               |
| `faktaruter` | nei     | Nøkkeltall på forsiden og på epokesiden. Tall telles opp.                                                    | Opptil 4. `[]` hvis ingen.                    |
| `galleri`    | nei     | Bildegalleri med lysboks på epokesiden                                                                       | Se `docs/bilder-mal.md`                       |
| `forEtter`   | nei     | Før/etter-glider på epokesiden                                                                               | Se `docs/bilder-mal.md`                       |
| `hovedbilde` | nei     | Bilde på forsiden og i toppseksjonen på epokesiden                                                           | Se `docs/bilder-mal.md`                       |

## 3. Brødteksten

Teksten under `---` deles i to med markøren `<!-- mer -->`:

```markdown
Første avsnitt – det viktigste om epoken.

Andre avsnitt.

Tredje avsnitt (valgfritt).

<!-- mer -->

### Mellomtittel (valgfritt)

Den lengre fortellingen. Vises bare på epokesiden, etter de første avsnittene.

Flere avsnitt …
```

| Del                  | Vises                  | Lengde                            |
| -------------------- | ---------------------- | --------------------------------- |
| Før `<!-- mer -->`   | Forsiden og epokesiden | 2–3 korte avsnitt, ca. 60–120 ord |
| Etter `<!-- mer -->` | Bare epokesiden        | Så lang som fortellingen trenger  |

- **Mellomtitler:** Bruk `###`, siden H1 og H2 allerede brukes av siden.
- **Formatering:** Vanlig Markdown fungerer, som _kursiv_, **fet** og lenker `[tekst](https://…)`. Bruk det sparsomt.
- **Setningene før markøren:** Skal fungere alene på forsiden. Unngå «som nevnt over» og lignende.
- **Forsiden ble stående:** Glemmer du markøren, vises hele teksten på forsiden.

## 4. Årstall og opptelling

- På forsiden telles årstallet opp fra forrige epokes `ar` til sitt eget. Den første epoken teller fra 1850.
- Med `ar: null` (bare for «i dag») vises `arVisning` uten opptelling.
- `arVisning` som starter med samme tall som `ar`, for eksempel `ar: 1945` og `arVisning: '1945–1960-tallet'`, vises som stort `1945` med resten i mindre skrift.

## 5. Tema: lys og tunnel

- `tunnel` gir mørk bakgrunn. Når temaet skifter mellom to epoker som står etter hverandre, går fargene gradvis over mens man scroller.
- Den første epoken med `tunnel` etter en med `lys` får «tunnellys»: en lys stripe som feier over hovedbildet én gang.
- I henhold til CLAUDE.md er epokene fra T-banen (1966) til og med Ringen (2006) `tunnel`, og resten er `lys`. Ikke endre dette uten å endre designet.

## 6. Engelsk versjon

Den engelske filen har de samme feltene. Oversett:

- `tittel`, `etikett` (egennavn beholdes), `ingress` og brødteksten
- `arVisning` (`'1945–1960s'`, `'Today →'`)
- `etikett` i faktarutene, og tekst i verdiene (`12 km` blir stående)
- `alt`, `bildetekst` og `sted` i bildefeltene

`slug`, `rekkefolge`, `ar`, `tema` og bildefilene er de samme. Legg også inn `<!-- mer -->` på samme sted i den engelske teksten.

## 7. Ny epoke

1. Lag filen på begge språk med ny `slug`.
2. Gi den riktig `rekkefolge`, og øk tallet for epokene som kommer etter, på begge språk.
3. Delingsbilde, sitemap og språkvelger lages automatisk.

## 8. Testene og innholdet

De automatiske testene er uavhengige av innholdet. De leser epokene fra innholdsfilene (`tests/innhold.ts`) og bruker dataene på selve siden. Du kan derfor endre titler, slugs, galleri og før/etter uten å røre testene:

- **Sidetestene** bruker første epoke, første tunnelepoke og siste epoke, uansett hva de heter.
- **Nettverkskartet og språkvelgeren** sjekker mot titlene som faktisk står i dataene.
- **Lysboks-testen** teller bildene i galleriet.
- **Før/etter-testen** bruker den første epoken som har glider. Har ingen epoke det, hoppes testen over.

Testene feiler bare når noe faktisk er ødelagt, for eksempel at en side ikke laster, at en epoke mangler engelsk motpart, eller at lysboksen ikke åpner.

## 9. Sjekk før du committer

```bash
npm run check    # fanger manglende felt og epoker som mangler på ett språk
npm run build    # bygger og lager delingsbilder med nye titler
npm test         # funksjonstester (krever bygget over)
npm run dev      # se forsiden og epokesidene på nb og en
```

- [ ] Alle fakta er kvalitetssikret. Det som mangler, er merket `[[TODO: …]]`, og kilden står i `src/data/kilder.json`.
- [ ] `<!-- mer -->` står etter 2–3 avsnitt, på begge språk.
- [ ] Tittel, etikett og ingress holder seg innenfor anbefalt lengde. Sjekk at delingsbildet i `dist/og/` ikke er for trangt.
- [ ] `slug`, `rekkefolge`, `ar` og `tema` er like på norsk og engelsk.
- [ ] Du har sett over forsiden på både mobil og desktop, også tunnelovergangen.
- [ ] `npm test` er grønn, eller testene i punkt 8 er oppdatert.

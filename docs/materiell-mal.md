# Mal: legge inn materiell (vogner og tog)

Denne malen viser hvordan du legger inn vogntyper. Hver vogntype blir ett kort som vises tre steder:

- i materiell-stripen på forsiden, som glir sidelengs
- på siden `/materiell/` (engelsk: `/en/rolling-stock/`)
- på `/kilder/`, der bildets kreditering listes automatisk

Kortene vises i kronologisk rekkefølge, sortert etter feltet `rekkefolge`.

## 1. Hver vogntype er to filer

| Språk   | Fil                                        |
| ------- | ------------------------------------------ |
| Norsk   | `src/content/materiell/materiell-NN.md`    |
| Engelsk | `src/content/en/materiell/materiell-NN.md` |

- **Filnavn:** Begge filene har samme navn, for eksempel `materiell-07.md`.
- **`NN`:** To sifre (`01`, `02` …) som bare holder filene i orden. Det er feltet `rekkefolge` som styrer rekkefølgen på nettstedet.
- **Alltid i par:** Lag alltid både den norske og den engelske filen. Bygget sjekker ikke at de samsvarer for materiell, så en fil som mangler, gjør at språkene viser ulikt antall kort.

## 2. Feltene

| Felt         | Påkrevd | Innhold                                                           | Eksempel                 |
| ------------ | ------- | ----------------------------------------------------------------- | ------------------------ |
| `rekkefolge` | ja      | Heltall som gir plassen i rekken. Samme tall på begge språk.      | `3`                      |
| `type`       | ja      | Typebetegnelse, vist i Plex Mono. Ikke oversett den.              | `'EKS-100'`              |
| `iDrift`     | ja      | Årene vogntypen var i drift, med tankestrek.                      | `'1900–1950'`, `'2020–'` |
| `setning`    | ja      | Én setning om vogntypen, opptil ca. 140 tegn.                     | `'…'`                    |
| `bilde`      | nei     | Foto av vogntypen. Uten bilde vises plassholderen «Bilde kommer». | se punkt 4               |

- Det er bare disse feltene som vises på kortet. Tekst under `---` brukes ikke.
- Alt som ikke er kvalitetssikret, skal stå som `[[TODO: …]]` (CLAUDE.md regel 3).

## 3. Eksempel: et komplett par

**Norsk:** `src/content/materiell/materiell-03.md`

```yaml
---
rekkefolge: 3
type: 'EKS-100'
iDrift: '1900–1950'
setning: 'Én kvalitetssikret setning om vogntypen.'
bilde:
  fil: ../../assets/photos/1900-eks100-01.jpg
  alt: 'Kort beskrivelse av hva bildet viser'
  bildetekst: 'Bildetekst under fotoet.'
  fotograf: 'Navn eller Ukjent'
  ar: 1900
  arkiv: 'Eier eller arkiv'
  lisens: 'CC BY 4.0'
  kilde: 'https://…'
---
```

**Engelsk:** `src/content/en/materiell/materiell-03.md`

```yaml
---
rekkefolge: 3
type: 'EKS-100'
iDrift: '1900–1950'
setning: 'One verified sentence about the vehicle type.'
bilde:
  fil: ../../../assets/photos/1900-eks100-01.jpg
  alt: 'Short description of what the image shows'
  bildetekst: 'Caption below the photo.'
  fotograf: 'Navn eller Ukjent'
  ar: 1900
  arkiv: 'Eier eller arkiv'
  lisens: 'CC BY 4.0'
  kilde: 'https://…'
---
```

> `EKS-100` og årstallene er fiktive og viser bare formatet. Bruk kun kvalitetssikrede opplysninger.

**Forskjellene mellom de to filene:**

- Bare `setning`, `alt` og `bildetekst` oversettes.
- Stien til bildet har ett `../` ekstra i den engelske filen, fordi den ligger én mappe dypere.
- Alt annet er likt.

## 4. Bildet

- **Plassering og navn:** Legg fotoet i `src/assets/photos/` med navn etter regelen `ÅR-emne-NN.jpg`, for eksempel `1900-eks100-01.jpg`.
- **Utsnitt:** Kortet viser bildet i 4:3, beskåret fra midten. Velg et foto der vognen står midt i bildet. Minst 640 px bredde holder.
- **Feltene:** `alt`, `lisens` og `kilde` er påkrevd, ellers stopper bygget. Se `docs/bilder-mal.md` for alle bildefeltene.
- **`kilde`:** Må være en fullstendig URL. Plassholderen `'https://…'` i eksemplet stopper bygget med vilje til den er byttet ut.

## 5. Plassholderne som finnes nå

`materiell-01.md` til `materiell-06.md` er plassholdere med `[[TODO]]`. Du kan gjøre ett av to:

- **Fylle dem ut:** Bytt ut feltene i den norske og den engelske filen.
- **Fjerne dem:** Slett begge filene, både norsk og engelsk.

Det kan være så mange kort du vil. På desktop festes stripen og glir sidelengs med scroll, og på mobil sveiper man.

## 6. Endre rekkefølgen

Det er bare `rekkefolge` som styrer rekkefølgen. Du trenger ikke endre filnavnene. Vil du sette inn en vogntype mellom 3 og 4, bruker du for eksempel 4 og øker tallet for de som kommer etter, på begge språk. Rekkefølgen skal være kronologisk etter når vogntypen ble satt i drift.

## 7. Sjekk før du committer

```bash
npm run check    # fanger manglende felt og feil bildesti
npm run build
npm run dev      # se kortene på / og /materiell/ (og /en/rolling-stock/)
```

- [ ] Både den norske og den engelske filen finnes, med samme `rekkefolge`, `type` og `iDrift`.
- [ ] `setning` er én setning, og alle fakta er kvalitetssikret.
- [ ] Bildet (hvis det er med) har `alt`, `lisens` og `kilde`, og riktig sti på begge språk.
- [ ] Plassholdere du ikke skal bruke, er slettet i begge språk.
- [ ] Kortene står i riktig rekkefølge på forsiden og på `/materiell/`.

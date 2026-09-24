# Mal: legge inn kilder

Denne malen viser hvordan du legger inn litteraturen og kildene bak fortellingen. De vises som en nummerert liste på `/kilder/` (engelsk: `/en/sources/`).

**Bildekreditering hører ikke hjemme her.** Den lages automatisk fra bildefeltene i innholdsfilene (se `docs/bilder-mal.md`) og vises i en egen tabell på samme side.

## 1. Filen

**Fil:** `src/data/kilder.json`

- En liste (JSON-array) med én oppføring per kilde.
- Den er felles for begge språk, fordi kildehenvisninger ikke oversettes.
- Er listen tom (`[]`), viser siden en `[[TODO]]`-melding i stedet.

## 2. Én kilde

```json
{
  "forfatter": "Etternavn, Fornavn",
  "tittel": "Tittel på boken eller artikkelen",
  "utgitt": 1900,
  "utgiver": "Forlag, tidsskrift eller arkiv",
  "lenke": "https://example.org/kilde"
}
```

> Verdiene er fiktive og viser bare formatet.

| Felt        | Påkrevd | Innhold                                                                                      |
| ----------- | ------- | -------------------------------------------------------------------------------------------- |
| `tittel`    | ja      | Tittelen slik den står i kilden. Vises i kursiv, og blir en lenke hvis `lenke` er fylt ut.   |
| `forfatter` | nei     | `Etternavn, Fornavn`. Flere forfattere skilles med semikolon: `Etternavn, A.; Etternavn, B.` |
| `utgitt`    | nei     | År som tall (`1900`) eller tekst (`'1900–1905'`, `'udatert'`)                                |
| `utgiver`   | nei     | Forlag, tidsskrift (gjerne med nummer) eller arkiv                                           |
| `lenke`     | nei     | Fullstendig URL (`https://…`). Bygget stopper hvis den ikke er en gyldig URL.                |

**Slik vises den på siden:**

> Etternavn, Fornavn: _Tittel på boken eller artikkelen_. Forlag, tidsskrift eller arkiv, 1900

Felt du utelater, blir ganske enkelt borte fra linjen.

## 3. Eksempler på ulike typer kilder

Alle eksemplene er fiktive.

```json
[
  {
    "forfatter": "Etternavn, Fornavn",
    "tittel": "En bok om emnet",
    "utgitt": 1900,
    "utgiver": "Forlaget"
  },
  {
    "forfatter": "Etternavn, A.; Etternavn, B.",
    "tittel": "En artikkel i et tidsskrift",
    "utgitt": 1950,
    "utgiver": "Tidsskriftet, nr. 3"
  },
  {
    "tittel": "Arkivmateriale: protokoller og kart",
    "utgitt": "1900–1950",
    "utgiver": "Arkivets navn, arkivreferanse"
  },
  {
    "tittel": "En nettside om emnet",
    "utgiver": "Nettstedets eier",
    "lenke": "https://example.org/side"
  }
]
```

| Type                          | Tips                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Bok                           | `forfatter`, `tittel`, `utgitt`, `utgiver` (forlaget)                                          |
| Artikkel                      | Skriv tidsskrift og nummer i `utgiver`                                                         |
| Arkivmateriale                | Oftest uten forfatter. Skriv arkiv og referanse i `utgiver`, og periode i `utgitt`.            |
| Nettside eller digitalt arkiv | Ta med `lenke`. Skriv gjerne i `tittel` hvilken dato du leste siden hvis den kan endre seg.    |
| Intervju eller muntlig kilde  | `tittel` for eksempel `Samtale med …`, og år i `utgitt`. Spør om samtykke før navn publiseres. |

## 4. Rekkefølge

Kildene vises i den rekkefølgen de står i filen. Anbefalingen er alfabetisk etter forfatterens etternavn. Kilder uten forfatter sorteres etter tittel, og står gjerne til slutt.

## 5. Skrivemåte i JSON

- Tekst står i doble anførselstegn: `"…"`. Et anførselstegn inne i teksten skrives `\"`. Du kan også bruke typografiske anførselstegn (« » eller “ ”), som ikke trenger noen spesialbehandling.
- Det skal være komma mellom oppføringene, men ikke etter den siste.
- Årstall som tall står uten anførselstegn (`1900`). Årstall som tekst står med (`"1900–1905"`).

## 6. Kildene og tekstene

- Tekstene på nettstedet skal bare bygge på kvalitetssikrede kilder (CLAUDE.md regel 3). Legg inn kilden her når du legger inn fakta fra den i en tekst.
- Det finnes ingen fotnoter eller henvisninger fra en enkelt tekst til en bestemt kilde. Listen gjelder hele nettstedet.

## 7. Sjekk før du committer

```bash
npm run check    # fanger manglende tittel og ugyldig lenke
npm run build
npm run dev      # se listen på /kilder/ og /en/sources/
```

- [ ] Alle kilder har `tittel`.
- [ ] `lenke` er en fullstendig URL som virker.
- [ ] Forfattere er skrevet `Etternavn, Fornavn`.
- [ ] Listen er sortert alfabetisk.
- [ ] Filen er gyldig JSON: komma mellom oppføringene, men ikke etter den siste.

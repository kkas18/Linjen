# Mal: legge inn nettverksdata

Denne malen viser hvordan du legger inn strekningene på nettverkskartet (`/nettverket/`, engelsk `/en/network/`). Kartet er skjematisk, i stil med et linjekart, og ikke geografisk nøyaktig. Dataene som ligger inne nå, er et forenklet startpunkt som skal erstattes eller justeres.

## 1. Filene

| Fil                         | Innhold                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `src/data/nettverk.json`    | Alle strekningssegmenter: type, år, form og norsk navn          |
| `src/data/nettverk.en.json` | Engelsk navn for hvert segment, der nøkkelen er segmentets `id` |

Teksten ved siden av kartet («hendelser for valgt år») hentes fra epokene, ikke fra disse filene. Den viser epoken som gjaldt i året som er valgt.

## 2. Ett segment

```json
{
  "id": "eksempel-linje",
  "type": "trikk",
  "apnet": 1900,
  "nedlagt": 1950,
  "navn": "Eksempellinje (fiktiv)",
  "path": "M 100 240 H 300 L 360 180 V 80"
}
```

> Verdiene i eksemplene er fiktive og viser bare formatet. Bruk kun kvalitetssikrede årstall og navn (CLAUDE.md regel 3).

| Felt      | Påkrevd | Innhold                                                                                                                 |
| --------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `id`      | ja      | Unik nøkkel med små bokstaver og bindestrek, for eksempel `holmenkolbanen`. Den brukes til å koble det engelske navnet. |
| `type`    | ja      | `hest`, `trikk`, `forstadsbane` eller `tbane`                                                                           |
| `apnet`   | ja      | Året strekningen åpnet (1875 eller senere). Den tegnes inn når glideren passerer dette året.                            |
| `nedlagt` | ja      | Året den ble nedlagt, eller `null` hvis den fortsatt er i drift. Fra dette året vises den stiplet og blek (15 %).       |
| `navn`    | ja      | Norsk navn. Vises som verktøytips når musepekeren står over linjen.                                                     |
| `path`    | ja      | Formen på strekningen, som SVG-kommandoer (se punkt 3)                                                                  |

**Hvordan typene vises** (kartet bruker ingen nye farger):

| Type           | Strek                               |
| -------------- | ----------------------------------- |
| `tbane`        | Tykk (6), trikkeblå. Tegnes øverst. |
| `forstadsbane` | Middels (4), mørk grå               |
| `trikk`        | Middels (3), grafitt                |
| `hest`         | Tynn (1,5), grafitt                 |

## 3. Tegne strekningen (`path`)

### Koordinatsystemet

- Kartet er **760 × 480**, med origo (0, 0) øverst til venstre. `x` øker mot høyre og `y` øker nedover.
- Hold deg innenfor ca. 40–720 i x og 40–440 i y, så linjene ikke kommer for nær kanten.
- Bruk et rutenett på **20** eller **40**, så linjer og kryss treffer hverandre nøyaktig.

### Kommandoer du kan bruke

| Kommando | Betyr                           | Eksempel    |
| -------- | ------------------------------- | ----------- |
| `M x y`  | Flytt dit (start på linjen)     | `M 100 240` |
| `H x`    | Vannrett linje til x            | `H 300`     |
| `V y`    | Loddrett linje til y            | `V 80`      |
| `L x y`  | Rett linje til punktet (skrå)   | `L 360 180` |
| `Z`      | Lukk formen (tilbake til start) | `Z`         |

Små bokstaver (`m`, `h`, `v`, `l`) betyr relative avstander. Kurver og buer (`C`, `Q`, `A`) er ikke tillatt, og bygget stopper hvis de brukes.

### 45°- og 90°-regelen

Linjekart bruker bare vannrette, loddrette og 45° skrå streker:

- **Vannrett og loddrett:** bruk `H` og `V`.
- **45° skrå:** bruk `L` og flytt like langt i x som i y, for eksempel fra (300, 240) til (360, 180): +60 i x og −60 i y.

### Eksempel steg for steg

```
M 100 240     start ved (100, 240)
H 300         vannrett til (300, 240)
L 360 180     45° skrått opp til høyre
V 80          loddrett opp til (360, 80)
```

## 4. Når en linje åpnet i etapper

Hvert segment har ett åpningsår og ett nedleggelsesår. En linje som åpnet eller ble lagt ned i flere etapper, deles derfor i flere segmenter som møtes i samme punkt:

```json
{ "id": "eksempel-etappe-1", "type": "tbane", "apnet": 1960, "nedlagt": null,
  "navn": "Eksempellinje, 1. etappe (fiktiv)", "path": "M 400 240 H 520" },
{ "id": "eksempel-etappe-2", "type": "tbane", "apnet": 1970, "nedlagt": null,
  "navn": "Eksempellinje, 2. etappe (fiktiv)", "path": "M 520 240 L 600 160" }
```

- **Samme punkt:** Etappe 2 starter nøyaktig der etappe 1 slutter (520, 240).
- **Ombygget eller gjenåpnet strekning:** Lag ett segment for hver periode. Det gamle får `nedlagt`, og det nye får et eget `id` og sitt eget `apnet`.
- **Delt trasé:** Går to typer i samme trasé, blir den tykkeste streken liggende øverst (T-bane over trikk).

## 5. Engelske navn

Hvert `id` i `nettverk.json` må ha et navn i `nettverk.en.json`, ellers stopper bygget:

```json
{
  "eksempel-linje": "Example line (fictional)",
  "eksempel-etappe-1": "Example line, stage 1 (fictional)"
}
```

Egennavn beholdes, for eksempel `Holmenkolbanen`. Forklarende tekst oversettes.

## 6. Skriveråd for tekstene på kartet

Kartet har tre slags tekst, og de ligger på tre forskjellige steder:

| Tekst                                                  | Hvor den ligger                                    | Mal                       |
| ------------------------------------------------------ | -------------------------------------------------- | ------------------------- |
| Segmentnavn (vises når musepekeren står over en linje) | `navn` i `nettverk.json` og `nettverk.en.json`     | dette punktet             |
| Hendelsen ved siden av kartet                          | Tittel og ingress fra epoken som gjaldt i valgt år | `docs/epoke-mal.md`       |
| Overskrift, innledning, knapper og forklaring          | `nettverk.*` i `src/i18n/nb.ts` og `en.ts`         | `docs/sidetekster-mal.md` |

### Segmentnavn

Når musepekeren står over en linje, vises navnet slik: **«navn (åpnet–nedlagt)»**. Årstallene legges til automatisk.

- **Ikke skriv årstall i navnet.** De kommer fra `apnet` og `nedlagt`. Står de i navnet også, vises de to ganger.
- **Bruk det etablerte navnet** når strekningen har et, for eksempel navnet på en bane eller tunnel. Egennavn skrives slik de er, og oversettes ikke.
- **Ellers beskriver du strekningen med endepunktene:** «[Type] [fra]–[til]», med tankestrek (–) uten mellomrom mellom stedene.
- **Etapper:** Legg til «, 1. etappe», «, 2. etappe» osv. etter navnet.
- **Kort:** opptil ca. 50 tegn. Navnet skal kunne leses i et lite verktøytips.
- **Ingen vurderinger eller forklaringer.** Historien hører hjemme i epoketekstene.
- **Plassholdere:** Mens et segment ikke er kvalitetssikret, kan navnet merkes «(skjematisk)» eller skrives som `[[TODO: navn]]`.

> Startdataene som ligger inne nå, følger ikke disse rådene fullt ut. For eksempel har ett navn årstall i parentes. De skal uansett erstattes med kvalitetssikrede data.

| Unngå                               | Bedre (mønster)      |
| ----------------------------------- | -------------------- |
| «[Navn] (1900–1950)»                | «[Navn]»             |
| «Den viktige nye linjen til [sted]» | «[Type] [fra]–[til]» |
| «Linje fra [fra] til [til] via …»   | «[Type] [fra]–[til]» |

### Engelske segmentnavn

- Egennavn beholdes. Bare typen eller beskrivelsen oversettes, for eksempel «Tunnel [fra]–[til]» og «Metro [fra]–[til]».
- Bruk de samme engelske ordene som forklaringen på kartet (`nettverk.typer` i `en.ts`): _Horse tramway_, _Tram_, _Suburban railway_ og _Metro (T-bane)_.
- «1. etappe» blir «stage 1».

### Sammenhengen mellom kart og epoker

- **Teksten ved siden av kartet** viser epoken med høyest årstall som ikke er senere enn valgt år. Vil du at kartet skal vise en bestemt hendelse, må den ha sin egen epoke.
- **Årstallene** i `nettverk.json` og i epokene bør stemme overens. Åpner en strekning i et år der en ny epoke starter, bør epoketeksten nevne den.

## 7. Hva bygget sjekker, og hva det ikke sjekker

**Bygget stopper ved:**

- `type` som ikke er en av de fire typene
- `apnet` før 1875, eller `nedlagt` som ikke er etter `apnet`
- `path` med ugyldige tegn eller kommandoer (for eksempel kurver)
- et `id` som mangler engelsk navn

**Dette sjekkes ikke, så du må kontrollere det selv:**

- at hvert `id` er unikt
- at linjene faktisk følger 45°/90°-regelen og treffer hverandre i kryssene
- at år og navn stemmer med kildene

## 8. Se resultatet

```bash
npm run dev
# åpne http://localhost:4321/Linjen/nettverket/
```

- Dra glideren gjennom årene, eller trykk «Spill av». Nye segmenter tegnes inn i åpningsåret, og nedlagte blir stiplet fra nedleggelsesåret.
- Hold musepekeren over en linje for å se navnet og årene.
- Sjekk både norsk og engelsk (`/en/network/`), og både mobil og desktop.

## 9. Sjekkliste før du committer

- [ ] Hvert segment har unikt `id`, riktig `type` og kvalitetssikret `apnet` og `nedlagt`.
- [ ] `path` bruker bare `M`, `H`, `V`, `L` og holder seg til 45°/90°.
- [ ] Segmenter som skal møtes, har nøyaktig samme koordinat i møtepunktet.
- [ ] Alle `id` har engelsk navn i `nettverk.en.json`.
- [ ] Navnene har ikke årstall og er opptil ca. 50 tegn. Egennavn er beholdt på engelsk.
- [ ] De forenklede startsegmentene er fjernet eller erstattet.
- [ ] `npm run check` og `npm run build` er grønne.
- [ ] Kilden for årstallene står i `src/data/kilder.json`.

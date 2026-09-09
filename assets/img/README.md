# Eigen afbeeldingen

Hier komen de foto's die van Studio Kader zelf zijn, in plaats van de
stockbeelden. `over-ons.html` verwacht deze twee bestanden, met exact deze
namen:

| Bestand                 | Wie              | Status                |
| ----------------------- | ---------------- | --------------------- |
| `kasper-jansen.jpg`     | Kasper Jansen    | nog toevoegen         |
| `giovanni-peterse.jpg`  | Giovanni Peterse | nog toevoegen         |

Zolang een bestand er niet staat, toont de browser op die plek een gebroken
afbeelding.

## Waar de foto op moet passen

De portretkaart is een liggend vlak met verhouding **4:3**. De foto wordt
gevuld met `object-fit: cover` en uitgesneden op `center 22%`, dus het
gezicht mag in de bovenste helft zitten — dat blijft goed staan.

- **Verhouding:** het liefst 4:3 liggend (bijvoorbeeld 1200 × 900 px).
  Een andere verhouding werkt ook, maar dan wordt er meer weggesneden.
- **Formaat:** minimaal 1200 px breed, en houd het bestand onder ±300 KB.
  Sla op als JPEG met kwaliteit 80 — dat is ruim voldoende en scheelt
  laadtijd.
- **Onderin:** over de onderste rand loopt een donker verloop met daarin het
  bronzen labeltje ("Co-founder & fotograaf"). Zet daar dus niets belangrijks.

Wijk je af van 1200 × 900, pas dan ook de `width` en `height` van de
`<img>` in `over-ons.html` aan. Die staan er om te voorkomen dat de pagina
verspringt tijdens het laden.

## Toevoegen via GitHub

1. Ga naar deze map op de branch:
   https://github.com/kaspermauricejansen/KADER-2/tree/claude/website-review-bixlt8/assets/img
2. **Add file → Upload files**, sleep de twee foto's erin.
3. Controleer of de namen kloppen (kleine letters, streepje, `.jpg`).
4. **Commit changes** — kies "Commit directly to the
   `claude/website-review-bixlt8` branch".

Dat werkt pull request #1 direct bij.

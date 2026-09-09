# Studio Kader — website

Statische website voor Studio Kader (interieurfotografie en cinematische video
walkthroughs, Breda). Geen server of database nodig: het zijn gewone
HTML-bestanden die je bij elke hoster kunt neerzetten.

## Wat staat waar

```
index.html               Homepage
portfolio.html           Overzicht van alle projecten (met filter)
over-ons.html            Kasper & Gio
werkwijze.html           De vier stappen + doelgroepen
tarieven.html            De drie pakketten
contact.html             Contactgegevens + offerteformulier
privacyverklaring.html   CONCEPT — moet nog nagelopen worden
voorwaarden.html         CONCEPT — moet nog nagelopen worden
404.html                 Foutpagina
projecten/*.html         Eén pagina per project (gegenereerd, zie hieronder)

assets/css/site.css      Gecompileerde stijlen (NIET met de hand wijzigen)
assets/js/site.js        Alle interactie: menu, FAQ, lightbox, formulier, sliders
favicon.svg              Icoon voor het browsertabblad
robots.txt, sitemap.xml  Voor zoekmachines

src/site.css             BRON van de stijlen — hier wijzig je CSS
tailwind.config.js       Kleuren en lettertypen
tools/build.mjs          Bouwscript (pagina's + sitemap)
tools/partials/          Kopbalk, voettekst, overlays — één keer onderhouden
tools/data/projects.json Alle projectgegevens
```

## Online zetten

Upload de volledige map, met uitzondering van `node_modules/`, `src/` en
`tools/` (die laatste twee zijn alleen nodig om te bouwen; ze doen geen
kwaad als ze meegaan). Werkt op elke hoster met statische bestanden —
Netlify, Vercel, Cloudflare Pages, GitHub Pages of gewoon FTP.

Alle links zijn relatief, dus de site werkt ook in een submap.

**Voor je live gaat:** vervang overal `https://studiokader.nl` door je echte
domein. Dat staat in de `<link rel="canonical">` en `og:url` van elke pagina,
in `robots.txt`, en in `SITE_URL` bovenaan `tools/build.mjs`.

## Iets wijzigen

### Gewone tekst
Open het betreffende `.html`-bestand en pas de tekst aan. Klaar — er is geen
bouwstap nodig.

### Kopbalk, menu of voettekst
Die staan in elk bestand, maar je onderhoudt ze op één plek:

1. wijzig `tools/partials/header.html` of `tools/partials/footer.html`
2. draai `npm run build:pages`

Het script zet het nieuwe blok in alle pagina's terug, tussen de markeringen
`<!-- @@include:header -->` en `<!-- @@endinclude -->`. Je eigen aanpassingen
buiten die markeringen blijven staan.

### Projecten toevoegen of wijzigen
1. pas `tools/data/projects.json` aan (kopieer een bestaand blok)
2. draai `npm run build:pages`

Dat schrijft de projectpagina in `projecten/`, plaatst de kaart op de
homepage en het portfolio, en werkt de sitemap bij.

### Kleuren, knoppen of andere stijlen
1. wijzig `src/site.css` (of `tailwind.config.js` voor kleuren)
2. draai `npm run build:css`

`assets/css/site.css` is het gecompileerde resultaat en wordt overschreven.

Eenmalig, voordat je kunt bouwen: `npm install`.

| Commando             | Wat het doet                        |
| -------------------- | ----------------------------------- |
| `npm run build`      | Pagina's én CSS opnieuw bouwen      |
| `npm run build:pages`| Alleen pagina's en sitemap          |
| `npm run build:css`  | Alleen de CSS                       |
| `npm run watch:css`  | CSS automatisch bij elke wijziging  |

## Het offerteformulier

De verzendknop opent nu het mailprogramma van de bezoeker met de aanvraag
al ingevuld. Wil je aanvragen automatisch in je mailbox krijgen, zonder dat
de bezoeker zelf nog op verzenden moet klikken? Maak dan een gratis account
bij bijvoorbeeld [Formspree](https://formspree.io) en zet je form-URL in
`assets/js/site.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/JOUW_ID';
```

Mailto blijft daarna de reservevariant als het versturen mislukt.

## Nog te doen

Zie `TODO-INHOUD.md` voor de punten die inhoudelijk of juridisch nog een
beslissing van Studio Kader vragen. In de HTML staan die ook als
`<!-- TODO: ... -->` op de plek waar ze horen.

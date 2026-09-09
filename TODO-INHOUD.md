# Nog te beslissen — inhoud, cijfers en juridisch

De techniek van de site is af. Dit lijstje gaat over keuzes die niemand
anders dan Studio Kader kan maken: welke claims je kunt onderbouwen, welke
gegevens echt zijn en welk beeldmateriaal je gebruikt. Alle punten staan ook
als `<!-- TODO: ... -->` in de HTML, op de plek waar ze horen.

Gesorteerd op urgentie.

## 1. Moet weg of gecorrigeerd vóór livegang

- [ ] **KVK 81234567 · BTW NL862014589B01** — placeholders uit het ontwerp.
      Onjuiste vermelding op een zakelijke site is een echt probleem.
      → `tools/partials/footer.html`, daarna `npm run build:pages`
- [ ] **"Funda & NVM gecertificeerd"** — deze organisaties certificeren geen
      fotografen. Vervang door iets dat wél klopt, bijvoorbeeld "levert
      conform Funda-specificaties" of een DuPho-lidmaatschap als je dat hebt.
      → `index.html`, in de balk onder de hero
- [x] **Teamportretten** — gedaan. De Unsplash-portretten van onbekende
      personen zijn vervangen door de echte foto's van Kasper en Giovanni
      (`assets/img/`, beide 1200 × 900 px). Gecontroleerd in de browser:
      beide laden, staan goed in de uitsnede en de labels vallen niet over
      een gezicht.
- [ ] **Portfolio bestaat uit stockbeelden** met specifieke resultaten
      eronder ("verkocht binnen 9 dagen", "3 biedingen boven vraagprijs").
      Vervang door echt werk, of label het duidelijk als voorbeeldweergave
      totdat je eigen projecten hebt.
      → `tools/data/projects.json`
- [ ] **Privacyverklaring en algemene voorwaarden** staan er nu als concept,
      met een geel blok bovenaan. Vul ze aan, laat ze nakijken en verwijder
      dat blok. Zonder privacyverklaring mag je via het formulier geen
      persoonsgegevens verzamelen.

## 2. Cijfers die elkaar tegenspreken

Kies één set die je kunt onderbouwen; een makelaar vraagt hiernaar.

- [ ] Snelheid van verkoop wordt op drie manieren genoemd:
      "2.1× sneller verkocht" (hero-badge), "verkooptijd gemiddeld −37%"
      (pijler 3, ≈1,6×) en "gem. 3 weken sneller verkocht" (werkwijze).
- [ ] De Airbnb-case: de klantervaring op de homepage zegt "+€22 per nacht",
      de projectpagina "+€28 / nacht".
- [ ] **250+ listings per jaar** naast "wij zijn twee mensen" komt neer op
      ongeveer vijf shoots per week. Kan kloppen, maar wees erop voorbereid.
- [ ] **4.9/5 uit 180+ reviews** — waar staan die reviews? Zonder vindbare
      bron is dit niet controleerbaar. Let op: in de structured data op de
      homepage staat bewust géén `aggregateRating`, want sterren in Google
      mogen alleen op basis van echte reviews.
- [ ] **"3× langer bekeken op Funda"** en **"+24% hogere conversie"** —
      voeg een bron toe of zwak af.

## 3. Feitelijke slordigheden

- [ ] **"Keizersgracht Residence"** staat in Breda Centrum — de Keizersgracht
      is Amsterdam. Kies een naam die bij het pand past.
- [ ] **"Duinvilla Kennemerland"** ligt volgens de gegevens in Teteringen;
      Kennemerland ligt bij Haarlem.
- [ ] **Mark Jansen** komt twee keer voor: als Superhost met vakantievilla's
      én als eigenaar van Villa Mastbosrand. Verwarrend als het dezelfde
      persoon moet zijn.
- [ ] **Klantervaringen** hebben geen bron. Vraag je klanten om een echte
      quote met naam en bedrijf, en verwijs naar Google-reviews als je die hebt.

## 4. Losse eindjes

- [ ] **Instagram en LinkedIn** in de voettekst linken naar `#`. Vul de echte
      profiel-URL's in of haal de iconen weg.
- [ ] **"Deze week: nog 2 plekken"** (contact) en "Boekingen beschikbaar deze
      & volgende week" (bovenste balk) staan vast in de HTML en verouderen.
      Pas ze periodiek aan of haal ze weg.
- [ ] **Pakketnamen** — de naam van pakket 3 ("Alles van pakket 2 + video's op
      alle formaten (dus ook voor social media)") leest als een interne
      notitie. Korte naam + uitleg in de opsomming werkt beter. Let op: de
      namen staan ook in de keuzelijst op `contact.html`.
- [ ] **Telefoonnummer +31 76 240 88 90** — controleer of dit het echte
      nummer is; het staat op zes plekken (kopbalk, voettekst, contact,
      WhatsApp-links en de structured data).
- [ ] **Domein** — vervang `https://studiokader.nl` door je echte domein,
      zie README.

## Weggehaald uit het ontwerp

- De balk **"Vertrouwd door toonaangevende makelaarskantoren & platforms"**.
  In de oorspronkelijke `index.html` werd die logobalk nooit gevuld door
  JavaScript, waardoor er alleen een lege zwarte strook met die tekst stond.
  Wil je hem terug, dan zijn er logo's van échte klanten nodig — met hun
  toestemming, want anders suggereert de balk een samenwerking die er niet is.
  De bijbehorende CSS (`.logo-marquee-inner`, `.brand-logo`) is niet
  meegenomen naar `src/site.css`; zeg het als je de balk wilt terugzetten,
  dan bouw ik hem opnieuw op met jouw logo's.

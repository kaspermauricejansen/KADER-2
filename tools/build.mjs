#!/usr/bin/env node
/* =========================================================================
   Studio Kader — bouwscript

   Doet drie dingen:
     1. Zet de gedeelde blokken (kopbalk, voettekst, overlays, <head>) in
        elke HTML-pagina, zodat je een menu-wijziging maar op één plek doet.
     2. Genereert de projectpagina's in /projecten uit tools/data/projects.json,
        plus de projectkaarten op de homepage en het portfolio.
     3. Schrijft sitemap.xml.

   Gebruik:  npm run build:pages
             (of 'npm run build' om daarna ook de CSS te compileren)

   De gegenereerde HTML-bestanden zijn gewone, complete bestanden. Je kunt
   ze direct bij een hoster neerzetten; dit script is alleen nodig als je
   de gedeelde blokken of de projectgegevens wilt wijzigen.
   ========================================================================= */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIALS = join(ROOT, 'tools', 'partials');

/* Pas dit aan naar je eigen domein voordat je live gaat. */
const SITE_URL = 'https://studiokader.nl';

const data = JSON.parse(readFileSync(join(ROOT, 'tools', 'data', 'projects.json'), 'utf8'));
const projects = data.projects;

/* ---------- kleine hulpjes ---------- */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const jsonAttr = (v) => attr(JSON.stringify(v));

const partial = (name) => readFileSync(join(PARTIALS, `${name}.html`), 'utf8').trimEnd();

/* ---------- projectkaart ---------- */
function projectCard(p, base) {
  const scenes = p.gallery.slice(0, 3).map((g) => g.src);
  return `<article class="work-card relative rounded-3xl overflow-hidden shadow-md bg-coal aspect-[4/3] group" data-category="${attr(p.categoryKey)}">
        <img src="${attr(p.cover)}" alt="${attr(p.gallery[0].alt)}" width="800" height="600" loading="lazy" decoding="async" class="work-img absolute inset-0 w-full h-full object-cover transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t from-coal/90 via-coal/20 to-transparent"></div>
        <a href="${base}projecten/${p.slug}.html" class="absolute inset-0 z-10" aria-label="Bekijk het project ${attr(p.title)}"></a>
        <span class="absolute top-4 left-4 chip bg-coal/70 text-cream backdrop-blur border border-white/15 z-20 pointer-events-none">${esc(p.location)}</span>
        <button type="button" data-walkthrough data-title="${attr(p.title)}" data-scenes="${jsonAttr(scenes)}" class="absolute top-4 right-4 chip bg-bronze text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center gap-1.5 z-20" aria-label="Bekijk de walkthrough-preview van ${attr(p.title)}">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Preview
        </button>
        <div class="absolute bottom-5 left-5 right-5 text-cream z-20 pointer-events-none">
          <p class="text-xs font-bold text-bronze-light uppercase tracking-wider">${esc(p.category)}</p>
          <h3 class="text-xl font-extrabold tracking-tight">${esc(p.title)}</h3>
          <p class="text-xs text-cream/80 mt-1">${esc(p.size)} · ${esc(p.result)}</p>
        </div>
      </article>`;
}

const cardsFor = (list, base) => list.map((p) => projectCard(p, base)).join('\n      ');

/* ---------- projectpagina ---------- */
function projectPage(p) {
  const others = projects.filter((x) => x.slug !== p.slug).slice(0, 3);
  const scenes = p.gallery.slice(0, 3).map((g) => g.src);
  const url = `${SITE_URL}/projecten/${p.slug}.html`;

  const stats = p.stats.map((s) => `<div class="bg-sand p-4 rounded-2xl border border-ink/10 text-center">
        <p class="text-xl font-extrabold">${esc(s.v)}</p>
        <p class="text-xs text-ink/70 mt-1">${esc(s.l)}</p>
      </div>`).join('\n      ');

  const gallery = p.gallery.map((g) => `<button type="button" data-lightbox-item data-full="${attr(g.src)}" class="gallery-thumb aspect-[4/3]" aria-label="Vergroot: ${attr(g.alt)}">
          <img src="${attr(g.src)}" alt="${attr(g.alt)}" width="600" height="450" loading="lazy" decoding="async" class="w-full h-full object-cover">
        </button>`).join('\n        ');

  const facts = [
    ['Locatie', p.location],
    ['Oppervlakte', p.size],
    ['Oplevering', p.duration],
    ['Resultaat', p.result],
  ].map(([k, v]) => `<div class="flex justify-between gap-4">
              <dt class="text-ink/70">${esc(k)}</dt>
              <dd class="font-extrabold text-right">${esc(v)}</dd>
            </div>`).join('\n            ');

  return `<!DOCTYPE html>
<html lang="nl" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(p.title)} — ${esc(p.category)} in ${esc(p.location)} | Studio Kader</title>
<meta name="description" content="${attr(p.metaDescription)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Studio Kader">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="${attr(p.title)} — Studio Kader">
<meta property="og:description" content="${attr(p.metaDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${attr(p.cover)}">
<meta name="twitter:card" content="summary_large_image">
<!-- @@include:head -->
<!-- @@endinclude -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/" },
    { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "${SITE_URL}/portfolio.html" },
    { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(p.title)}, "item": "${url}" }
  ]
}
</script>
</head>
<body data-page="project" class="bg-cream text-ink antialiased">

<!-- @@include:header -->
<!-- @@endinclude -->

<main id="main">
<section class="py-10 sm:py-16 hero-glow">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">

    <nav aria-label="Kruimelpad" class="text-xs font-bold text-ink/60 mb-6">
      <ol class="flex flex-wrap items-center gap-2">
        <li><a href="../index.html" class="hover:text-bronze">Home</a></li>
        <li aria-hidden="true">·</li>
        <li><a href="../portfolio.html" class="hover:text-bronze">Portfolio</a></li>
        <li aria-hidden="true">·</li>
        <li aria-current="page" class="text-ink">${esc(p.title)}</li>
      </ol>
    </nav>

    <div class="flex flex-wrap items-center gap-2 mb-4">
      <span class="chip bg-sand text-ink">${esc(p.category)}</span>
      <span class="chip bg-sand text-ink">${esc(p.location)}</span>
      <span class="chip bg-sand text-ink">${esc(p.size)}</span>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl">${esc(p.title)}</h1>
      <p class="text-sm sm:text-base font-bold text-bronze-dark">★ ${esc(p.result)}</p>
    </div>

    <div class="relative mt-8 rounded-3xl overflow-hidden shadow-2xl bg-coal aspect-[16/9] border border-ink/10 group">
      <img src="${attr(p.cover)}" alt="${attr(p.gallery[0].alt)}" width="1600" height="900" fetchpriority="high" decoding="async" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-coal/70 via-transparent to-black/10"></div>
      <button type="button" data-walkthrough data-title="${attr(p.title)}" data-scenes="${jsonAttr(scenes)}" class="absolute inset-0 grid place-items-center w-full" aria-label="Bekijk de walkthrough-preview van ${attr(p.title)}">
        <span class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cream/95 text-ink grid place-items-center shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-bronze group-hover:text-white">
          <svg class="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </span>
      </button>
      <span class="absolute top-4 left-4 chip bg-coal/70 text-cream backdrop-blur border border-white/15 text-[11px] pointer-events-none">Klik voor walkthrough-preview</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
      ${stats}
    </div>

    <div class="grid lg:grid-cols-3 gap-10 mt-10">
      <div class="lg:col-span-2">
        <h2 class="text-2xl font-extrabold tracking-tight">Over dit project</h2>
        <p class="mt-4 text-ink/80 leading-relaxed text-sm sm:text-base">${esc(p.description)}</p>

        <h2 class="text-lg font-extrabold tracking-tight mt-10">Voor &amp; na bewerking</h2>
        <p class="text-ink/70 text-xs sm:text-sm mt-1">Sleep de balk om het verschil te zien tussen de ruwe opname en de eindbewerking. Met het toetsenbord: pijltjestoetsen.</p>
        <div class="relative mt-4 aspect-[16/10] rounded-2xl overflow-hidden border border-ink/10 shadow-md select-none" data-compare>
          <img src="${attr(p.cover)}" alt="${attr(p.gallery[0].alt)} — na bewerking" width="1200" height="750" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover">
          <div data-compare-side class="absolute top-0 left-0 h-full overflow-hidden" style="width:50%;">
            <img src="${attr(p.gallery[0].src)}" alt="${attr(p.gallery[0].alt)} — ruwe opname" width="1200" height="750" loading="lazy" decoding="async" class="absolute inset-0 h-full object-cover" style="width:100vw;max-width:none;filter:saturate(.7) contrast(.9) brightness(.92);">
          </div>
          <span class="absolute top-3 left-3 chip bg-black/60 text-white text-[10px] border border-white/20 z-30 pointer-events-none">RAW</span>
          <span class="absolute top-3 right-3 chip bg-black/60 text-white text-[10px] border border-white/20 z-30 pointer-events-none">BEWERKT</span>
          <button type="button" data-compare-handle class="p2v-handle" style="left:50%;" role="slider" aria-label="Vergelijk ruwe opname en eindbewerking" aria-valuemin="5" aria-valuemax="95" aria-valuenow="50">
            <span class="p2v-circle">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>
            </span>
          </button>
        </div>

        <h2 class="text-lg font-extrabold tracking-tight mt-12">Fotogalerij</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5" data-gallery>
          ${gallery}
        </div>

        <h2 class="text-lg font-extrabold tracking-tight mt-12">Video walkthrough — alle formaten</h2>
        <div class="flex flex-wrap gap-2.5 mt-4" id="formatTabs" role="tablist" aria-label="Videoformaat">
          <button type="button" class="tab-btn active" role="tab" aria-selected="true" data-format="landscape">16:9 Funda / TV</button>
          <button type="button" class="tab-btn" role="tab" aria-selected="false" data-format="vertical">9:16 Reels / TikTok</button>
          <button type="button" class="tab-btn" role="tab" aria-selected="false" data-format="square">1:1 Social</button>
        </div>
        <div class="relative mt-5 bg-black rounded-2xl overflow-hidden border border-ink/10 select-none mx-auto transition-all duration-500" id="detailPlayerWrap" style="aspect-ratio:16/9;max-width:100%;">
          <div id="detailScenes" class="absolute inset-0" data-scenes="${jsonAttr(scenes)}"></div>
          <div class="absolute inset-0 vignette pointer-events-none"></div>
          <div class="absolute top-4 left-4 flex items-center gap-2 bg-coal/70 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-cream text-[10px] font-extrabold uppercase tracking-widest">
            <span class="w-2 h-2 rounded-full bg-red-500 rec-blink" aria-hidden="true"></span>
            <span>4K Cinematic</span>
          </div>
          <div class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-coal via-coal/60 to-transparent">
            <div class="flex items-center gap-3 text-cream">
              <button type="button" id="detailPlayBtn" class="w-10 h-10 rounded-full bg-cream text-ink grid place-items-center hover:bg-bronze hover:text-white transition-colors shrink-0" aria-label="Afspelen">
                <svg id="detailPlayIcon" class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div class="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div id="detailProgress" class="h-full bg-bronze-light rounded-full transition-all duration-100" style="width:0%"></div>
              </div>
              <span id="detailTime" class="text-xs font-bold tabular-nums shrink-0">0:00 / 0:24</span>
            </div>
          </div>
        </div>
        <p class="text-xs text-ink/60 mt-3">Dit is een preview van onze beeldstijl, opgebouwd uit stills van dit project.</p>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-sand rounded-3xl p-7 border border-ink/10 lg:sticky lg:top-24">
          <h2 class="text-xs font-extrabold uppercase tracking-widest text-bronze-dark">Projectgegevens</h2>
          <dl class="mt-5 space-y-4 text-sm">
            ${facts}
          </dl>
          <blockquote class="mt-7 pt-6 border-t border-ink/15">
            <p class="text-sm font-bold text-ink/85">"${esc(p.quote)}"</p>
            <footer class="text-xs text-ink/60 mt-2">${esc(p.author)}</footer>
          </blockquote>
          <a href="../contact.html" class="btn btn-dark w-full mt-7">Vergelijkbare shoot aanvragen</a>
        </div>
      </div>
    </div>

    <div class="mt-16">
      <h2 class="text-xl font-extrabold tracking-tight mb-6">Andere projecten</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cardsFor(others, '../')}
      </div>
    </div>

  </div>
</section>

<section class="py-16 lg:py-24 bg-coal text-cream relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background:radial-gradient(850px 500px at 92% 10%, rgba(169,137,91,.14), transparent 70%), radial-gradient(650px 500px at 4% 92%, rgba(169,137,91,.10), transparent 65%)" aria-hidden="true"></div>
  <div class="mx-auto max-w-7xl px-5 sm:px-8 relative z-10 text-center">
    <span class="kicker kicker-center text-bronze-light">Ook zo presenteren?</span>
    <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Vraag een offerte aan voor jouw <span class="font-serif-italic font-normal text-bronze-light">object</span></h2>
    <p class="mt-4 text-cream/80 max-w-xl mx-auto">Binnen 72 uur geleverd. Persoonlijk contact met Kasper &amp; Gio.</p>
    <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <a href="../contact.html" class="btn btn-bronze">
        <span>Direct offerte aanvragen</span>
        <svg class="arr w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <a href="../portfolio.html" class="btn btn-ghost-light">Terug naar portfolio</a>
    </div>
  </div>
</section>
</main>

<!-- @@include:footer -->
<!-- @@endinclude -->

<!-- @@include:overlays -->
<!-- @@endinclude -->

<script src="../assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- gedeelde blokken in een pagina zetten ---------- */
function syncIncludes(html, base) {
  return html.replace(
    /<!-- @@include:([a-z-]+) -->[\s\S]*?<!-- @@endinclude -->/g,
    (whole, name) => {
      let body;
      if (name === 'cards-home') body = cardsFor(projects.slice(0, 3), base);
      else if (name === 'cards-portfolio') body = cardsFor(projects, base);
      else body = partial(name).replace(/\{\{BASE\}\}/g, base);
      return `<!-- @@include:${name} -->\n${body}\n<!-- @@endinclude -->`;
    }
  );
}

/* ---------- uitvoeren ---------- */
const projectDir = join(ROOT, 'projecten');
if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

let written = 0;

for (const p of projects) {
  const file = join(projectDir, `${p.slug}.html`);
  writeFileSync(file, syncIncludes(projectPage(p), '../'), 'utf8');
  console.log(`  projecten/${p.slug}.html`);
  written++;
}

const rootPages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
for (const f of rootPages) {
  const file = join(ROOT, f);
  const src = readFileSync(file, 'utf8');
  const out = syncIncludes(src, '');
  if (out !== src) {
    writeFileSync(file, out, 'utf8');
    console.log(`  ${f} (blokken bijgewerkt)`);
    written++;
  }
}

/* ---------- sitemap ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ['', '1.0'],
  ['portfolio.html', '0.9'],
  ['tarieven.html', '0.9'],
  ['contact.html', '0.8'],
  ['werkwijze.html', '0.7'],
  ['over-ons.html', '0.6'],
  ['privacyverklaring.html', '0.2'],
  ['voorwaarden.html', '0.2'],
  ...projects.map((p) => [`projecten/${p.slug}.html`, '0.7']),
];

writeFileSync(
  join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, prio]) => `  <url>
    <loc>${SITE_URL}/${u}</loc>
    <lastmod>${today}</lastmod>
    <priority>${prio}</priority>
  </url>`).join('\n')}
</urlset>
`,
  'utf8'
);
console.log('  sitemap.xml');
console.log(`\nKlaar — ${written} pagina('s) geschreven of bijgewerkt.`);

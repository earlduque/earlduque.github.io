const fs = require('fs');
const path = require('path');

const linksDir = path.join(__dirname, 'links');
const manifestPath = path.join(linksDir, 'index.json');

// Read all .json files except index.json
const files = fs.readdirSync(linksDir)
  .filter(f => f.endsWith('.json') && f !== 'index.json');

const links = files.map(file => {
  const filePath = path.join(linksDir, file);
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing ${file}:`, e);
    return null;
  }
}).filter(Boolean);

// Sort by order
links.sort((a, b) => a.order - b.order);

// Write manifest
fs.writeFileSync(manifestPath, JSON.stringify(links, null, 2));
console.log(`Manifest generated with ${links.length} links.`);

// ============================================
// Pre-render the cards into index.html
// ============================================
// Crawlers and social unfurlers don't run JS, so the link grid has to exist in
// the served HTML. This writes the same markup Vue would render, between the
// markers in index.html; scripts.js only re-renders if the live JSON drifts.

const indexPath = path.join(__dirname, 'index.html');
const START = '<!-- links:start -->';
const END = '<!-- links:end -->';
const JSONLD_START = '<!-- jsonld:start -->';
const JSONLD_END = '<!-- jsonld:end -->';

const esc = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Mirrors the #links-template markup in index.html — keep the two in sync.
const renderCard = (link, index) => `        <a
          href="${esc(link.href)}"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card${index === 0 ? ' featured' : ''}"
          style="--i:${index}"
        >
          <div class="card-border"></div>
          <div class="card-spotlight"></div>
          <div class="card-inner">
            <div class="card-icon">
              <i class="${esc(link.icon)}"></i>
            </div>
            <div class="card-text">
              <span class="card-title">${esc(link.title)}</span>
              <span class="card-desc">${esc(link.description)}</span>
            </div>
            <svg
              class="card-arrow"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </div>
        </a>`;

// Replace everything between two marker comments, keeping `indent` before the
// closing marker so index.html stays tidy.
function replaceBetween(html, startMarker, endMarker, content, indent) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    console.error(
      `Could not find the ${startMarker} / ${endMarker} markers in index.html.`
    );
    process.exit(1);
  }
  return (
    html.slice(0, start + startMarker.length) +
    '\n' +
    content +
    '\n' +
    indent +
    html.slice(end)
  );
}

// ============================================
// Structured data (JSON-LD)
// ============================================
// Tells search engines that the profile links are all the same person, and that
// the products are software this person made. Driven by the `kind` field on each
// link: `profile` -> Person.sameAs, `product` -> its own SoftwareApplication,
// `contact` -> Person.email if it's a mailto:, and `other` -> left out.

const PERSON_ID = 'https://earlduque.com/#earl';

const buildJsonLd = (activeLinks) => {
  const byKind = (kind) => activeLinks.filter((l) => l.kind === kind);

  const mailto = byKind('contact').find((l) => l.href.startsWith('mailto:'));

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Earl Duque',
    url: 'https://earlduque.com',
    image: 'https://earlduque.com/images/earlwind.JPEG',
    jobTitle: 'Developer Advocate',
    worksFor: { '@type': 'Organization', name: 'ServiceNow' },
    sameAs: byKind('profile').map((l) => l.href),
  };
  if (mailto) person.email = mailto.href.replace(/^mailto:/, '');

  const products = byKind('product').map((l) => ({
    '@type': 'SoftwareApplication',
    '@id': l.href,
    name: l.title,
    url: l.href,
    description: l.description,
    ...(l.schema || {}),
    author: { '@id': PERSON_ID },
  }));

  return { '@context': 'https://schema.org', '@graph': [person, ...products] };
};

// Same filter and sort scripts.js applies, so the signatures match
const activeLinks = links.filter((l) => l.active);

let html = fs.readFileSync(indexPath, 'utf8');

const cards = activeLinks.map(renderCard).join('\n');
html = replaceBetween(html, START, END, cards, '        ');

const jsonLd = JSON.stringify(buildJsonLd(activeLinks), null, 2)
  .split('\n')
  .map((l) => '      ' + l)
  .join('\n');
const script = `    <script type="application/ld+json">\n${jsonLd}\n    </script>`;
html = replaceBetween(html, JSONLD_START, JSONLD_END, script, '    ');

fs.writeFileSync(indexPath, html);

const counts = activeLinks.reduce((acc, l) => {
  acc[l.kind || 'unset'] = (acc[l.kind || 'unset'] || 0) + 1;
  return acc;
}, {});
console.log(`Pre-rendered ${activeLinks.length} active links into index.html.`);
console.log(
  `Structured data: ${counts.profile || 0} profiles, ${counts.product || 0} products` +
    ` (kinds: ${JSON.stringify(counts)}).`
);

const unset = activeLinks.filter((l) => !l.kind).map((l) => l.title);
if (unset.length) {
  console.warn(
    `  Warning: no "kind" set, omitted from structured data: ${unset.join(', ')}`
  );
}

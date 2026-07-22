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

const html = fs.readFileSync(indexPath, 'utf8');
const start = html.indexOf(START);
const end = html.indexOf(END);

if (start === -1 || end === -1 || end < start) {
  console.error(
    `Could not find the ${START} / ${END} markers in index.html — cards not pre-rendered.`
  );
  process.exit(1);
}

// Same filter and sort scripts.js applies, so the signatures match
const activeLinks = links.filter((l) => l.active);
const cards = activeLinks.map(renderCard).join('\n');

const updated =
  html.slice(0, start + START.length) +
  '\n' +
  cards +
  '\n        ' +
  html.slice(end);

fs.writeFileSync(indexPath, updated);
console.log(`Pre-rendered ${activeLinks.length} active links into index.html.`);

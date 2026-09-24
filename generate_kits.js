const fs = require('fs');
const path = require('path');

// ============================================
// Pre-render the kits page
// ============================================
// kits/kits.json is the source of truth (kit.co is gone, so this is a one-time
// import from its data export, hand-curated since). This writes the static
// markup between the markers in kits/index.html — no JS needed to see it.

const kitsPath = path.join(__dirname, 'kits', 'kits.json');
const pagePath = path.join(__dirname, 'kits', 'index.html');
const START = '<!-- kits:start -->';
const END = '<!-- kits:end -->';

const kits = JSON.parse(fs.readFileSync(kitsPath, 'utf8'));

const esc = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// "https://www.amazon.com/dp/..." -> "amazon.com", shown under the item name
const storeName = (href) =>
  new URL(href).hostname.replace(/^(www|store)\./, '');

// Cap the entrance stagger so long kits don't take seconds to finish appearing
const MAX_STAGGER = 12;

const renderItem = (item, icon, i) => `            <a
              href="${esc(item.href)}"
              target="_blank"
              rel="noopener noreferrer"
              class="link-card compact"
              style="--i:${Math.min(i, MAX_STAGGER)}"
            >
              <div class="card-border"></div>
              <div class="card-spotlight"></div>
              <div class="card-inner">
                <div class="card-icon">
                  <i class="${esc(icon)}"></i>
                </div>
                <div class="card-text">
                  <span class="card-title">${esc(item.name)}</span>
                  <span class="card-desc">${esc(storeName(item.href))}</span>
                </div>
                <svg
                  class="card-arrow"
                  width="16"
                  height="16"
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

const countItems = (kit) =>
  kit.groups.reduce((n, g) => n + g.items.length, 0);

const renderKit = (kit) => {
  let i = 0;
  const groups = kit.groups
    .map(
      (group) => `        <div class="kit-group">
          <h3 class="kit-group-label">${esc(group.name)}</h3>
          <div class="links-grid">
${group.items.map((item) => renderItem(item, group.icon, i++)).join('\n')}
          </div>
        </div>`
    )
    .join('\n');

  return `      <section class="kit-section" id="${esc(kit.slug)}">
        <h2 class="kit-heading">
          <span class="kit-heading-slash">//</span> ${esc(kit.title)}
          <span class="kit-heading-count">${countItems(kit)} items</span>
        </h2>
${groups}
      </section>`;
};

const nav = `      <nav class="kit-nav" aria-label="Kits">
${kits
  .map(
    (kit) =>
      `        <a class="kit-chip" href="#${esc(kit.slug)}">// ${esc(kit.nav || kit.title)}</a>`
  )
  .join('\n')}
      </nav>`;

const content = [nav, ...kits.map(renderKit)].join('\n\n');

let html = fs.readFileSync(pagePath, 'utf8');
const start = html.indexOf(START);
const end = html.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`Could not find the ${START} / ${END} markers in kits/index.html.`);
  process.exit(1);
}
html =
  html.slice(0, start + START.length) +
  '\n' +
  content +
  '\n      ' +
  html.slice(end);
fs.writeFileSync(pagePath, html);

console.log(
  `Pre-rendered ${kits.length} kits (${kits.map(countItems).reduce((a, b) => a + b, 0)} items) into kits/index.html.`
);

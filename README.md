# earlduque.github.io

Personal link hub for [earlduque.com](https://earlduque.com).

## Tech Stack

- **Vue.js 2** - Dynamic link rendering from JSON data
- **CSS Houdini** (`@property`) - Animated gradient borders and avatar ring
- **Canvas API** - Particle constellation background with mouse interaction
- **Inter + JetBrains Mono** - Typography
- **Font Awesome 6** - Icons
- **GitHub Pages** - Hosting with custom domain

## Dynamic Links System

Links are managed as individual JSON files in the `links/` folder. Each file represents a link:

```json
{
  "order": 1,
  "active": true,
  "href": "https://example.com/",
  "image": "images/example.png",
  "icon": "fab fa-example",
  "title": "Example",
  "description": "Description of the link."
}
```

| Field | Purpose |
|-------|---------|
| `order` | Display order (lower = first). First link spans full width as "featured" |
| `active` | Set `false` to hide without deleting |
| `href` | Destination URL |
| `image` | Card image (kept for backwards compatibility) |
| `icon` | Font Awesome class (e.g. `fab fa-github`) |
| `title` | Display title |
| `description` | Short description |

## How It Works

The link cards are **pre-rendered into `index.html`** between the `<!-- links:start -->` and `<!-- links:end -->` markers. Crawlers and social unfurlers don't run JavaScript, so this is the only version of the links they ever see — and it means the grid paints before any network request.

At runtime `scripts.js` still fetches the links (GitHub API first, `links/index.json` as fallback) and compares them against what's already in the DOM. If they match — the normal case — nothing happens. If they've drifted, Vue mounts over `#app` using the `#links-template` and re-renders. So editing a JSON file directly on github.com still updates the live site, without the fetch being on the critical path.

**Add a link:** Create a new JSON file (e.g. `14-newlink.json`), run `node generate_links_manifest.js`, then commit and push *both* `links/index.json` and `index.html`.

**Disable a link:** Set `"active": false` and regenerate.

**Reorder links:** Change the `"order"` values and regenerate.

> Skipping the regeneration still works for visitors (the runtime fetch catches the drift), but crawlers will keep seeing the stale list. Always regenerate.

## Generating

```sh
node generate_links_manifest.js
```

Writes two files:

- `links/index.json` — the manifest, used as a fallback when the GitHub API is unavailable
- `index.html` — the pre-rendered cards, between the markers

The generated markup mirrors the `#links-template` in `index.html`; if you change one, change the other, or the runtime comparison will see a mismatch and re-render on every load.

## Local Development

Open `index.html` directly in a browser — the pre-rendered links show up with no server or network needed.

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

The site loads all JSON files from `links/` via the GitHub API at runtime. No build step required.

**Add a link:** Create a new JSON file (e.g. `09-newlink.json`), commit, push. It appears automatically.

**Disable a link:** Set `"active": false`.

**Reorder links:** Change the `"order"` values.

## Local Development

Open `index.html` directly in a browser. Links will load from the GitHub API.

For offline development, generate the fallback manifest:

```sh
node generate_links_manifest.js
```

This creates `links/index.json` which is used when the GitHub API is unavailable.

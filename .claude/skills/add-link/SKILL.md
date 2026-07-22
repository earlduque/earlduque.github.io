---
name: add-link
description: Add a new link tile to earlduque.com's link hub, end-to-end — creates the JSON file, regenerates the manifest, commits, and pushes to origin. Use whenever the user wants to add, create, or publish a new link/tile/app/game on the website.
---

# Adding a link tile to earlduque.com

This repo renders one tile per JSON file in `links/`. See `README.md` for the schema.

## Steps

1. **Gather fields** from the user's request:
   - `title` — display name
   - `href` — destination URL
   - `description` — short description, matching the site's existing tone (e.g. "An app I made, available on the App Store", "A game I made, available on Steam")
   - `icon` — a Font Awesome 6.5.2 class (this repo pins that version — confirm via the FA `<link>` tag in `index.html` if unsure). Prefer a brand icon (`fab fa-*`) for known platforms (App Store → no dedicated FA brand icon, use a fitting solid icon; Steam → `fab fa-steam`; GitHub → `fab fa-github`; etc.), otherwise pick a sensible `fa-solid fa-*` icon.
   - `image` — leave `""` unless the user supplies one
   - `active` — `true` unless told otherwise
   - `kind` — what the link *is*. Drives the JSON-LD structured data; the tile renders the same either way. Pick one:
     - `profile` — a social/professional profile belonging to Earl himself (LinkedIn, GitHub, Bluesky…). Goes into `Person.sameAs`.
     - `product` — an app or game Earl made (App Store, Steam…). Becomes its own `SoftwareApplication`.
     - `contact` — a way to reach him (`mailto:`, scheduling links).
     - `other` — anything else, including channels or sites owned by an organization rather than by Earl. When in doubt between `profile` and `other`, choose `other`: claiming someone else's page as his identity is a real error, whereas omitting one just forgoes a minor SEO signal.
   - `schema` — **products only**, optional. Extra schema.org fields for the `SoftwareApplication` node:
     ```json
     "schema": { "applicationCategory": "GameApplication", "operatingSystem": "iOS" }
     ```
     Use `GameApplication` for games; pick another [applicationCategory](https://schema.org/applicationCategory) for non-games. Set `operatingSystem` from where it actually ships (App Store → `iOS`; Steam → check the store page's system requirements, e.g. `Windows, macOS`). Don't guess — if you can't confirm, omit the field.

2. **Determine `order`** — read all `links/*.json` except `index.json`, find the max `order`, use `max + 1`.

3. **Pick a filename** — `links/NN-slug.json`, where `NN` is the new order number and `slug` is a kebab-case short form of the title (e.g. `11-hex7.json`).

4. **Write the file**, matching the field order used by existing files (`schema` last, and only for products):
   ```json
   {
     "order": <n>,
     "active": true,
     "kind": "<profile|product|contact|other>",
     "href": "<url>",
     "image": "",
     "icon": "<fa class>",
     "title": "<title>",
     "description": "<description>"
   }
   ```

5. **Regenerate the manifest and pre-rendered cards**:
   ```sh
   node generate_links_manifest.js
   ```
   This rewrites two files, and **both must be committed**:
   - `links/index.json` — the manifest, used as a fallback when the GitHub API is unavailable.
   - `index.html` — two generated blocks: the static link cards between `<!-- links:start -->` / `<!-- links:end -->` (crawlers and social unfurlers don't run JS, so this is the only version of the links they ever see), and the JSON-LD structured data between `<!-- jsonld:start -->` / `<!-- jsonld:end -->`.

   Check the command's output — it prints a per-`kind` count and warns about any link missing a `kind`. Confirm the new tile shows up in both diffs. Never hand-edit the markup between the markers — regenerate instead.

6. **Commit and push**:
   - Run `git status` first to see what's actually changed/untracked.
   - If the local branch is behind `origin/main`, `git pull` (fast-forward) before committing.
   - Stage the new link file, `links/index.json`, and `index.html` — don't sweep up unrelated changes.
   - Commit message style: `Add <Title> link` (short, imperative — check `git log` for the pattern).
   - Push to `origin main`.

   Committing and pushing without a separate confirmation prompt is expected here — the user set this skill up specifically to be end-to-end. Still run `git status`/`git diff` before staging so nothing unexpected gets swept in, and skip ahead and ask if something looks off (unrelated pending changes, merge conflicts, unexpected diff in `links/index.json`).

## Notes

- Never reorder or edit *other* link files — only add the new one and regenerate the manifest.
- If you change the card markup, update it in **both** places: the `#links-template` in `index.html` and `renderCard()` in `generate_links_manifest.js`. If they drift, `scripts.js` sees a signature mismatch and re-renders the grid on every page load.
- If an icon choice is ambiguous, pick the closest sensible Font Awesome 6 class and just say what you chose — don't block on asking.

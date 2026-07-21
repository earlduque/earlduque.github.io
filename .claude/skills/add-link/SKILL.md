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

2. **Determine `order`** — read all `links/*.json` except `index.json`, find the max `order`, use `max + 1`.

3. **Pick a filename** — `links/NN-slug.json`, where `NN` is the new order number and `slug` is a kebab-case short form of the title (e.g. `11-hex7.json`).

4. **Write the file**, matching the field order used by existing files:
   ```json
   {
     "order": <n>,
     "active": true,
     "href": "<url>",
     "image": "",
     "icon": "<fa class>",
     "title": "<title>",
     "description": "<description>"
   }
   ```

5. **Regenerate the manifest**:
   ```sh
   node generate_links_manifest.js
   ```
   This rewrites `links/index.json`, the fallback used when the GitHub API is unavailable. Confirm the new tile shows up in the diff.

6. **Commit and push**:
   - Run `git status` first to see what's actually changed/untracked.
   - If the local branch is behind `origin/main`, `git pull` (fast-forward) before committing.
   - Stage only the new link file and `links/index.json` — don't sweep up unrelated changes.
   - Commit message style: `Add <Title> link` (short, imperative — check `git log` for the pattern).
   - Push to `origin main`.

   Committing and pushing without a separate confirmation prompt is expected here — the user set this skill up specifically to be end-to-end. Still run `git status`/`git diff` before staging so nothing unexpected gets swept in, and skip ahead and ask if something looks off (unrelated pending changes, merge conflicts, unexpected diff in `links/index.json`).

## Notes

- Never reorder or edit *other* link files — only add the new one and regenerate the manifest.
- If an icon choice is ambiguous, pick the closest sensible Font Awesome 6 class and just say what you chose — don't block on asking.

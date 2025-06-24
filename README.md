# earlduque.github.io

# Earl Duque - Links

## Dynamic Links System

Links are now managed as individual JSON files in the `links/` folder. Each file represents a link and must have the following structure:

```
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

- **order**: Controls the display order (lower numbers appear first).
- **active**: Set to `false` to hide a link without deleting it.
- **href**: The URL the link points to.
- **image**: Path or URL to the image for the card.
- **icon**: Font Awesome icon class for the card header.
- **title**: The display title.
- **description**: The card description.

## How It Works

The site automatically loads all JSON files from the `links/` folder using the GitHub API. Simply add, remove, or edit JSON files in the `links/` folder and the changes will appear on the website immediately (no build step required).

**To add a new link:**
1. Create a new JSON file in the `links/` folder (e.g., `09-newlink.json`)
2. Follow the structure above
3. Commit and push to GitHub
4. The link appears on the website automatically

**To disable a link:**
- Set `"active": false` in the JSON file

**To reorder links:**
- Change the `"order"` value in the JSON files

## Development Tools

For local development or if you prefer manual control, you can still use the manifest generation script:

```sh
node generate_links_manifest.js
```

This creates a `links/index.json` file that serves as a fallback if the GitHub API is unavailable.

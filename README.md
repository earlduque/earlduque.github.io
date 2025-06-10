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

To add a new link, create a new JSON file in the `links/` folder following the above structure. The site will automatically display all active links in order.

## Automating the Manifest

To avoid manually updating `links/index.json`, use the provided Node.js script:

```sh
node generate_links_manifest.js
```

This will scan all JSON files in the `links/` folder (except `index.json`), sort them by order, and regenerate the manifest. Run this script any time you add, remove, or edit a link file.
This file provides instructions and context to the Gemini agent.

## About This Project

This is my personal website. It's a simple, static site that I use to share my social media links and other information.

## Gemini's Role

Your primary role is to help me maintain and update this website. This includes:

- Adding new links to the `links/` directory.
- Updating the `index.html` file to reflect changes in the `links/` directory.
- Helping me with any other tasks related to this website.

## Project Structure

- `index.html`: The main HTML file for the website.
- `styles.css`: The CSS file for the website.
- `scripts.js`: The JavaScript file for the website.
- `links/`: A directory containing JSON files for each of my social media links.
- `images/`: A directory containing images used on the website.

## Common Tasks

### Adding a new link

To add a new link, you will need to:

1. Create a new JSON file in the `links/` directory.
2. The JSON file should have the following format:

```json
{
  "url": "https://www.example.com",
  "title": "Example",
  "image": "images/example.png"
}
```

3. Run the `generate_links_manifest.js` script to update the `links/index.json` file.
4. Update the `index.html` file to include the new link.

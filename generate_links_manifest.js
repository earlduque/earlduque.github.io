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

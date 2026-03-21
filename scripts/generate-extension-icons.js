/**
 * Generates 48x48 and 128x128 PNG icons for the RumbleTipper extension.
 * Run from project root: node scripts/generate-extension-icons.js
 * Requires: npm install pngjs --save-dev
 */
const fs = require('fs');
const path = require('path');

let PNG;
try {
  PNG = require('pngjs').PNG;
} catch (e) {
  console.error('Missing "pngjs" package. Run: npm install pngjs --save-dev');
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Orange #ea580c = rgb(234, 88, 12), white = rgb(255,255,255)
const bg = [234, 88, 12, 255];
const fg = [255, 255, 255, 255];

function setPixel(data, width, x, y, rgba) {
  const idx = (width * y + x) << 2;
  data[idx] = rgba[0];
  data[idx + 1] = rgba[1];
  data[idx + 2] = rgba[2];
  data[idx + 3] = rgba[3];
}

function drawR(data, size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const w = Math.max(2, Math.floor(s * 0.14));
  const h = Math.max(4, Math.floor(s * 0.35));
  // Vertical bar
  for (let y = Math.floor(cy - h); y <= Math.floor(cy + h); y++) {
    for (let dx = 0; dx < w; dx++) {
      const x = Math.floor(cx - s * 0.22) + dx;
      if (x >= 0 && x < s && y >= 0 && y < s) setPixel(data, s, x, y, fg);
    }
  }
  // Top horizontal
  for (let x = Math.floor(cx - s * 0.22); x <= Math.floor(cx + s * 0.18); x++) {
    for (let dy = 0; dy < w; dy++) {
      const y = Math.floor(cy - h) + dy;
      if (x >= 0 && x < s && y >= 0 && y < s) setPixel(data, s, x, y, fg);
    }
  }
  // Middle horizontal
  for (let x = Math.floor(cx - s * 0.22); x <= Math.floor(cx); x++) {
    for (let dy = 0; dy < w; dy++) {
      const y = Math.floor(cy - dy);
      if (x >= 0 && x < s && y >= 0 && y < s) setPixel(data, s, x, y, fg);
    }
  }
  // Diagonal leg
  for (let i = 0; i <= Math.floor(h * 1.2); i++) {
    const x = Math.floor(cx - s * 0.08 + i * 0.35);
    const y = Math.floor(cy + i * 0.5);
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
      if (x + dx >= 0 && x + dx < s && y >= 0 && y < s) setPixel(data, s, x + dx, y, fg);
    }
  }
}

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = bg[0];
      png.data[idx + 1] = bg[1];
      png.data[idx + 2] = bg[2];
      png.data[idx + 3] = bg[3];
    }
  }
  drawR(png.data, size);
  return PNG.sync.write(png);
}

[48, 128].forEach((s) => {
  const buf = createIcon(s);
  const file = path.join(outDir, `icon${s}.png`);
  fs.writeFileSync(file, buf);
  console.log('Wrote', file);
});

console.log('Done. Reload the extension in chrome://extensions if needed.');

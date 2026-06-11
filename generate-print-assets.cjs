// Generates print-ready SVGs for VistaPrint business card
// Run: node generate-print-assets.js
// Output: sunburst.svg, weave-pattern.svg

const fs = require('fs');

const C = {
  espresso: '#3D2B1F',
  beige:    '#D4A97A',
  gold:     '#C8922A',
  red:      '#B8503E',
  cream:    '#F5EDD6',
};

// ── Sunburst ─────────────────────────────────────────────────────────────────
// 900×900, warm brown rays on espresso — very subtle brown-on-brown effect
const rays   = 24;
const size   = 900;
const cx     = size / 2, cy = size / 2, r = size / 2;
const opFull = 0.18;   // very subtle — even rays at 0.18, odd at 0.09
const rayColor = '#7A4E2D'; // warm brown, a few stops lighter than espresso
const toRad  = d => (d * Math.PI) / 180;

let rayPaths = '';
for (let i = 0; i < rays; i++) {
  const a1 = (i * 360) / rays;
  const a2 = a1 + 360 / rays / 2;
  const x1 = cx + r * Math.cos(toRad(a1 - 90));
  const y1 = cy + r * Math.sin(toRad(a1 - 90));
  const x2 = cx + r * Math.cos(toRad(a2 - 90));
  const y2 = cy + r * Math.sin(toRad(a2 - 90));
  const op = i % 2 === 0 ? opFull : opFull * 0.5;
  rayPaths += `  <path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${rayColor}" opacity="${op.toFixed(3)}"/>\n`;
}

const sunburst = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${C.espresso}"/>
${rayPaths}  <circle cx="${cx}" cy="${cy}" r="${(r * 0.18).toFixed(2)}" fill="${rayColor}" opacity="${(opFull * 1.2).toFixed(3)}"/>
</svg>`;

fs.writeFileSync('sunburst.svg', sunburst);
console.log('✓ sunburst.svg');

// ── Weave Pattern ─────────────────────────────────────────────────────────────
// 1200×1200 canvas tiled with the 24×24 weave motif from TextileBorder
// Uses SVG native <pattern> so it stays fully vector / infinitely scalable
// scale(8) → each tile is 24×8 = 192px. Canvas = 192×10 = 1920 on each axis = exactly 10×10 tiles, no partial tiles at any edge.
const tileScale = 6;
const tilePx    = 24 * tileScale; // 192
const weaveCols = 10;
const weaveW    = tilePx * weaveCols; // 1920
const weaveH    = tilePx * weaveCols; // 1920

const weave = `<svg xmlns="http://www.w3.org/2000/svg" width="${weaveW}" height="${weaveH}" viewBox="0 0 ${weaveW} ${weaveH}">
  <defs>
    <pattern id="weave" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="scale(${tileScale})">
      <rect width="24" height="24" fill="${C.beige}"/>
      <polygon points="12,2 22,12 12,22 2,12" fill="${C.red}" opacity="0.7"/>
      <polygon points="12,6 18,12 12,18 6,12" fill="${C.cream}"/>
      <polygon points="12,9 15,12 12,15 9,12" fill="${C.espresso}" opacity="0.5"/>
      <rect x="0"  y="0"  width="2" height="2" fill="${C.espresso}" opacity="0.4"/>
      <rect x="22" y="0"  width="2" height="2" fill="${C.espresso}" opacity="0.4"/>
      <rect x="0"  y="22" width="2" height="2" fill="${C.espresso}" opacity="0.4"/>
      <rect x="22" y="22" width="2" height="2" fill="${C.espresso}" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="${weaveW}" height="${weaveH}" fill="url(#weave)"/>
</svg>`;

fs.writeFileSync('weave-pattern.svg', weave);
console.log('✓ weave-pattern.svg');

console.log('\nDone. Open either file in Chrome, right-click → Save image as… to get a PNG,');
console.log('or upload the .svg directly to VistaPrint (vector = no quality loss at any size).');

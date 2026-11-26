// Generates the app icon SVGs (no AI image, no text). Output goes to assets/.
import { writeFileSync } from 'node:fs';

const BG = '#140D08';
const cols = [262, 362, 462, 562, 662, 762];
const rows = [380, 644];
const pebbleColors = ['#3A3A3A', '#2E2E2E', '#C9A56B', '#A8824F', '#8A6A45', '#D8BC88'];
const offsets = [[-17, -9], [16, -10], [-14, 12], [18, 10]];

function pits() {
  let out = '';
  rows.forEach((cy, r) => {
    cols.forEach((cx, c) => {
      out += `<rect x="${cx - 42}" y="${cy - 56}" width="84" height="112" rx="42" fill="url(#pit)" stroke="#2A1A10" stroke-width="4"/>\n`;
      offsets.forEach(([dx, dy], i) => {
        const color = pebbleColors[(r * 6 + c + i * 2) % pebbleColors.length];
        const x = cx + dx;
        const y = cy + dy;
        const rot = ((r * 7 + c * 5 + i * 13) % 50) - 25;
        out += `<ellipse cx="${x}" cy="${y}" rx="17" ry="12" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>\n`;
        out += `<ellipse cx="${x - 5}" cy="${y - 5}" rx="5" ry="3" fill="#FFFFFF" opacity="0.25" transform="rotate(${rot} ${x} ${y})"/>\n`;
      });
    });
  });
  return out;
}

const board = `
<rect x="172" y="300" width="680" height="424" rx="64" fill="url(#wood)" stroke="#2B180C" stroke-width="6"/>
<rect x="190" y="318" width="644" height="388" rx="50" fill="none" stroke="#B07A3F" stroke-opacity="0.35" stroke-width="3"/>
${pits()}`;

const defs = `
<defs>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7A4A2A"/>
    <stop offset="1" stop-color="#4A2A16"/>
  </linearGradient>
  <radialGradient id="pit" cx="0.5" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#3A2415"/>
    <stop offset="1" stop-color="#1C110A"/>
  </radialGradient>
</defs>`;

// Full icon: square, background filled (store / iOS icon, no transparency).
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
${defs}
<rect width="1024" height="1024" fill="${BG}"/>
${board}
</svg>
`;

// Adaptive foreground: transparent, board scaled into Android's safe zone.
const foreground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
${defs}
<g transform="translate(512 512) scale(0.72) translate(-512 -512)">
${board}
</g>
</svg>
`;

writeFileSync('assets/icon.svg', icon);
writeFileSync('assets/adaptive-icon.svg', foreground);
console.log('wrote assets/icon.svg and assets/adaptive-icon.svg');

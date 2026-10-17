/* Renders the app icon (logo loop arrows on ink background) to icons/icon-{192,512}.png.
   No dependencies: strokes are rasterised by distance to the path, PNG is encoded with zlib.
   Run: node tools/make-icons.js */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const BG = [0x29, 0x29, 0x23], INK = [0xd7, 0xb1, 0x75];
// Logo paths in the 24-unit grid of the header SVG, flattened to polylines.
function arc(cx, cy, r, a0, a1, steps = 24) {
  const pts = [];
  for (let i = 0; i <= steps; i++) { const a = a0 + (a1 - a0) * i / steps; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}
const PATHS = [
  [[17, 2], [21, 6], [17, 10]],
  [[3, 11], [3, 10], ...arc(7, 10, 4, Math.PI, 1.5 * Math.PI), [21, 6]],
  [[7, 22], [3, 18], [7, 14]],
  [[21, 13], [21, 14], ...arc(17, 14, 4, 0, 0.5 * Math.PI), [3, 18]]
];
const segs = PATHS.flatMap(p => p.slice(1).map((b, i) => [p[i], b]));

function distToSeg(x, y, [[ax, ay], [bx, by]]) {
  const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len)) : 0;
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
}

function render(size) {
  // The 24-unit logo occupies 240/512 of the icon: inside the maskable safe zone.
  const scale = size * 10 / 512, offset = size * 136 / 512, half = 2.3 / 2;
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 3); // filter byte 0 + RGB
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5 - offset) / scale, y = (py + 0.5 - offset) / scale;
      let d = Infinity;
      for (const s of segs) d = Math.min(d, distToSeg(x, y, s));
      const cover = Math.max(0, Math.min(1, (half - d) * scale + 0.5)); // ~1px antialiasing
      for (let c = 0; c < 3; c++) row[1 + px * 3 + c] = Math.round(BG[c] + (INK[c] - BG[c]) * cover);
    }
    rows.push(row);
  }
  return png(size, size, zlib.deflateSync(Buffer.concat(rows), { level: 9 }));
}

function crc32(buf) {
  let c, crc = ~0;
  for (const b of buf) { c = (crc ^ b) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return ~crc >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(w, h, idat) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
for (const size of [192, 512]) fs.writeFileSync(path.join(out, `icon-${size}.png`), render(size));
console.log('icons/icon-192.png, icons/icon-512.png written');

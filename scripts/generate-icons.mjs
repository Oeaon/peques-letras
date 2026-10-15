// Genera todos los iconos de la app a partir de un único dibujo vectorial.
// Uso: npm run icons

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => join(root, 'assets', p);

const BG_TOP = '#FFB547';
const BG_BOTTOM = '#FF6B6B';
const INK = '#4D7CFE';
const DOT = '#2DBE6C';

// La "A" en un lienzo de 1024 x 1024, con el mismo estilo que la pizarra de la app.
const TOP = [512, 236];
const LEFT = [312, 800];
const RIGHT = [712, 800];
const BAR = [
  [383, 612],
  [641, 612],
];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const TRACED = lerp(TOP, LEFT, 0.62);

const path = (...pts) => `M${pts.map((p) => p.join(' ')).join(' L')}`;
const LETTER = [path(LEFT, TOP, RIGHT), path(...BAR)];

function sparkle(cx, cy, r, fill) {
  const k = r * 0.28;
  return `<path d="M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r}Z" fill="${fill}"/>`;
}

/** El dibujo central. `mono` = solo siluetas blancas (icono monocromo de Android). */
function artwork({ mono = false } = {}) {
  const stroke = (d, color, width, extra = '') =>
    `<path d="${d}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none" ${extra}/>`;

  if (mono) {
    return [...LETTER.map((d) => stroke(d, '#fff', 132)), sparkle(790, 300, 70, '#fff'), sparkle(236, 380, 44, '#fff')].join('');
  }

  const traced = path(TOP, TRACED);
  return [
    // Sombra suave debajo de la letra
    ...LETTER.map((d) => stroke(d, 'rgba(120,30,30,0.18)', 132, 'transform="translate(0 18)"')),
    // Letra blanca
    ...LETTER.map((d) => stroke(d, '#fff', 132)),
    // Guía discontinua por el centro
    ...LETTER.map((d) => stroke(d, '#FFC9B0', 10, 'stroke-dasharray="26 26"')),
    // Parte ya repasada, con brillo
    stroke(traced, INK, 104),
    stroke(traced, 'rgba(255,255,255,0.45)', 22, 'transform="translate(-14 -10)"'),
    // Punto verde que se arrastra
    `<circle cx="${TRACED[0]}" cy="${TRACED[1]}" r="74" fill="#fff"/>`,
    `<circle cx="${TRACED[0]}" cy="${TRACED[1]}" r="58" fill="${DOT}"/>`,
    `<circle cx="${TRACED[0] - 18}" cy="${TRACED[1] - 20}" r="16" fill="rgba(255,255,255,0.55)"/>`,
    // Destellos
    sparkle(790, 300, 70, '#FFF3B0'),
    sparkle(236, 380, 44, '#fff'),
    sparkle(820, 520, 30, '#fff'),
  ].join('');
}

const gradient = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOTTOM}"/></linearGradient></defs>`;

function svg({ background = 'full', scale = 1, mono = false, size = 1024 } = {}) {
  let bg = '';
  if (background === 'full') bg = `<rect width="1024" height="1024" fill="url(#bg)"/>`;
  if (background === 'tile') bg = `<rect x="64" y="64" width="896" height="896" rx="220" fill="url(#bg)"/>`;
  const t = `translate(${512 - 512 * scale} ${512 - 512 * scale}) scale(${scale})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${gradient}${bg}<g transform="${t}">${background === 'only' ? '' : artwork({ mono })}</g></svg>`;
}

async function render(file, svgText, size) {
  const target = out(file);
  mkdirSync(dirname(target), { recursive: true });
  await sharp(Buffer.from(svgText)).resize(size, size).png().toFile(target);
  console.log('✓', file);
}

await render('images/icon.png', svg(), 1024);
await render('images/android-icon-foreground.png', svg({ background: 'none', scale: 0.68 }), 1024);
await render('images/android-icon-background.png', svg({ background: 'full', scale: 0 }).replace(/<g transform[^>]*>.*<\/g>/, ''), 1024);
await render('images/android-icon-monochrome.png', svg({ background: 'none', scale: 0.68, mono: true }), 1024);
await render('images/splash-icon.png', svg({ background: 'tile', scale: 0.82 }), 1024);
await render('images/favicon.png', svg({ background: 'tile', scale: 0.82 }), 96);
await render('store/icono-play-512.png', svg(), 512);

writeFileSync(out('store/icono.svg'), svg());
console.log('✓ store/icono.svg');

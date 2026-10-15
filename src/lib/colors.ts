export const colors = {
  background: '#FFF7E8',
  backgroundEnd: '#FFE9D6',
  card: '#FFFFFF',
  text: '#3B2F4A',
  textSoft: '#8A7F99',
  guide: '#EEE8F5',
  guideDash: '#C9BEDA',
  pending: '#D5CCE2',
  target: '#2DBE6C',
  star: '#FFC531',
};

export const fonts = {
  regular: 'Fredoka_500Medium',
  bold: 'Fredoka_700Bold',
};

/** Un color alegre por letra, para que cada una se sienta distinta. */
export const palette = ['#FF6B6B', '#FF9F43', '#F7B731', '#2DBE6C', '#1FB5D6', '#4D7CFE', '#9B5DE5', '#F15BB5'];

export function colorFor(index: number) {
  return palette[index % palette.length];
}

/** Oscurece un color hex (para el canto de las fichas). */
export function darken(hex: string, amount = 0.18) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c * (1 - amount));
  const r = f(n >> 16);
  const g = f((n >> 8) & 0xff);
  const b = f(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Mezcla un color con blanco (para fondos suaves). */
export function tint(hex: string, amount = 0.85) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c + (255 - c) * amount);
  const r = f(n >> 16);
  const g = f((n >> 8) & 0xff);
  const b = f(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

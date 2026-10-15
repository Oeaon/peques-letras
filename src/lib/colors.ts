export const colors = {
  background: '#FFF7E8',
  card: '#FFFFFF',
  text: '#3B2F4A',
  textSoft: '#8A7F99',
  guide: '#EEE8F5',
  guideDash: '#C9BEDA',
  pending: '#D5CCE2',
  target: '#2DBE6C',
};

/** Un color alegre por letra, para que cada una se sienta distinta. */
export const palette = ['#FF6B6B', '#FF9F43', '#F7C531', '#2DBE6C', '#1FB5D6', '#4D7CFE', '#9B5DE5', '#F15BB5'];

export function colorFor(index: number) {
  return palette[index % palette.length];
}

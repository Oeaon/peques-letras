import { arc, join, line, type Stroke } from '@/lib/geometry';

export type Glyph = {
  id: string;
  char: string;
  kind: 'letra' | 'numero';
  /** Lo que dice la voz al terminar: "A de Avión", "Tres". */
  say: string;
  /** Dibujo de recompensa. Provisional hasta tener ilustraciones propias. */
  emoji: string;
  /** Trazos en el orden en que se escriben, cada uno en su sentido correcto. */
  strokes: Stroke[];
};

// Caja de 100 x 100: arriba y = 10, centro y = 50, abajo y = 90.
const O = arc(50, 50, 32, 40, -90, -450);

const letters: Omit<Glyph, 'kind'>[] = [
  { id: 'a', char: 'A', say: 'A de Avión', emoji: '✈️', strokes: [line([50, 10], [20, 90]), line([50, 10], [80, 90]), line([32, 62], [68, 62])] },
  {
    id: 'b', char: 'B', say: 'B de Ballena', emoji: '🐋',
    strokes: [
      line([25, 10], [25, 90]),
      join(line([25, 10], [52, 10]), arc(52, 30, 22, 20, -90, 90), line([52, 50], [25, 50])),
      join(line([25, 50], [56, 50]), arc(56, 70, 24, 20, -90, 90), line([56, 90], [25, 90])),
    ],
  },
  { id: 'c', char: 'C', say: 'C de Casa', emoji: '🏠', strokes: [arc(52, 50, 32, 40, -45, -315)] },
  {
    id: 'd', char: 'D', say: 'D de Dado', emoji: '🎲',
    strokes: [line([25, 10], [25, 90]), join(line([25, 10], [42, 10]), arc(42, 50, 36, 40, -90, 90), line([42, 90], [25, 90]))],
  },
  {
    id: 'e', char: 'E', say: 'E de Elefante', emoji: '🐘',
    strokes: [line([30, 10], [30, 90]), line([30, 10], [74, 10]), line([30, 50], [66, 50]), line([30, 90], [74, 90])],
  },
  { id: 'f', char: 'F', say: 'F de Foca', emoji: '🦭', strokes: [line([30, 10], [30, 90]), line([30, 10], [74, 10]), line([30, 50], [66, 50])] },
  { id: 'g', char: 'G', say: 'G de Gato', emoji: '🐱', strokes: [arc(50, 50, 32, 40, -40, -360), line([56, 50], [82, 50])] },
  { id: 'h', char: 'H', say: 'H de Helado', emoji: '🍦', strokes: [line([25, 10], [25, 90]), line([75, 10], [75, 90]), line([25, 50], [75, 50])] },
  { id: 'i', char: 'I', say: 'I de Isla', emoji: '🏝️', strokes: [line([50, 10], [50, 90])] },
  { id: 'j', char: 'J', say: 'J de Jirafa', emoji: '🦒', strokes: [join(line([65, 10], [65, 68]), arc(45, 68, 20, 22, 0, 180))] },
  { id: 'k', char: 'K', say: 'K de Koala', emoji: '🐨', strokes: [line([28, 10], [28, 90]), line([74, 10], [28, 56]), line([44, 42], [76, 90])] },
  { id: 'l', char: 'L', say: 'L de León', emoji: '🦁', strokes: [line([30, 10], [30, 90], [74, 90])] },
  { id: 'm', char: 'M', say: 'M de Mono', emoji: '🐵', strokes: [line([20, 90], [20, 10], [50, 62], [80, 10], [80, 90])] },
  { id: 'n', char: 'N', say: 'N de Nube', emoji: '☁️', strokes: [line([25, 90], [25, 10], [75, 90], [75, 10])] },
  {
    id: 'enye', char: 'Ñ', say: 'Eñe de Ñu', emoji: '🦬',
    strokes: [line([25, 90], [25, 24], [75, 90], [75, 24]), line([34, 14], [42, 7], [50, 11], [58, 15], [66, 8])],
  },
  { id: 'o', char: 'O', say: 'O de Oso', emoji: '🐻', strokes: [O] },
  { id: 'p', char: 'P', say: 'P de Pato', emoji: '🦆', strokes: [line([27, 10], [27, 90]), join(line([27, 10], [52, 10]), arc(52, 30, 22, 20, -90, 90), line([52, 50], [27, 50]))] },
  { id: 'q', char: 'Q', say: 'Q de Queso', emoji: '🧀', strokes: [O, line([56, 66], [82, 92])] },
  {
    id: 'r', char: 'R', say: 'R de Ratón', emoji: '🐭',
    strokes: [line([27, 10], [27, 90]), join(line([27, 10], [52, 10]), arc(52, 30, 22, 20, -90, 90), line([52, 50], [27, 50])), line([48, 50], [76, 90])],
  },
  { id: 's', char: 'S', say: 'S de Sol', emoji: '☀️', strokes: [join(arc(50, 30, 25, 20, -30, -270), arc(50, 70, 26, 20, -90, 150))] },
  { id: 't', char: 'T', say: 'T de Tren', emoji: '🚂', strokes: [line([20, 10], [80, 10]), line([50, 10], [50, 90])] },
  { id: 'u', char: 'U', say: 'U de Uva', emoji: '🍇', strokes: [join(line([25, 10], [25, 60]), arc(50, 60, 25, 30, 180, 0), line([75, 60], [75, 10]))] },
  { id: 'v', char: 'V', say: 'V de Vaca', emoji: '🐄', strokes: [line([20, 10], [50, 90], [80, 10])] },
  { id: 'w', char: 'W', say: 'W de Wafle', emoji: '🧇', strokes: [line([12, 10], [30, 90], [50, 35], [70, 90], [88, 10])] },
  { id: 'x', char: 'X', say: 'X de Xilófono', emoji: '🎶', strokes: [line([22, 10], [78, 90]), line([78, 10], [22, 90])] },
  { id: 'y', char: 'Y', say: 'Y de Yoyó', emoji: '🪀', strokes: [line([20, 10], [50, 50]), line([80, 10], [50, 50], [50, 90])] },
  { id: 'z', char: 'Z', say: 'Z de Zapato', emoji: '👞', strokes: [line([22, 10], [78, 10], [22, 90], [78, 90])] },
];

const numberWords = ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
const numberEmoji = ['🫙', '🍎', '🐟', '⭐', '🎈', '🌸', '🐞', '🍓', '🐥', '🚗'];

const numberStrokes: Stroke[][] = [
  [arc(50, 50, 27, 40, -90, -450)],
  [line([34, 26], [55, 10], [55, 90])],
  [join(arc(50, 32, 25, 22, -160, 20), line([73.5, 39.5], [25, 90], [78, 90]))],
  [join(arc(50, 30, 25, 20, -150, 90), arc(50, 70, 27, 20, -90, 150))],
  [line([58, 10], [20, 65], [80, 65]), line([62, 36], [62, 90])],
  [join(line([72, 10], [32, 10], [30, 46]), arc(48, 65, 26, 25, -130, 140))],
  [join(arc(56, 55, 30, 45, -70, -180), arc(51, 66, 25, 24, 180, -180))],
  [line([22, 10], [78, 10], [40, 90])],
  [join(arc(50, 30, 22, 20, -60, -270), arc(50, 70, 26, 20, -90, 270), arc(50, 30, 22, 20, 90, -60))],
  [arc(50, 32, 25, 22, 0, -360), line([75, 32], [70, 90])],
];

export const LETTERS: Glyph[] = letters.map((g) => ({ ...g, kind: 'letra' }));

export const NUMBERS: Glyph[] = numberStrokes.map((strokes, n) => ({
  id: String(n),
  char: String(n),
  kind: 'numero',
  say: numberWords[n],
  emoji: numberEmoji[n],
  strokes,
}));

export const ALL_GLYPHS: Glyph[] = [...LETTERS, ...NUMBERS];

export function findGlyph(id: string) {
  return ALL_GLYPHS.find((g) => g.id === id);
}

/** Siguiente en la misma categoría (letra → letra, número → número). */
export function nextGlyph(glyph: Glyph) {
  const list = glyph.kind === 'letra' ? LETTERS : NUMBERS;
  return list[(list.indexOf(glyph) + 1) % list.length];
}

// Todas las coordenadas viven en una caja de 100 x 100 (eje Y hacia abajo, como en SVG).

export type Point = { x: number; y: number };
export type Stroke = Point[];

/** Polilínea a partir de pares [x, y]. */
export function line(...coords: [number, number][]): Stroke {
  return coords.map(([x, y]) => ({ x, y }));
}

/**
 * Arco de elipse. Ángulos en grados: 0 = derecha, 90 = abajo, -90 = arriba.
 * Si `to` < `from` se recorre en sentido antihorario (visto en pantalla).
 */
export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
): Stroke {
  const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 10));
  const points: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    points.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return points;
}

/** Une varios tramos en un único trazo continuo. */
export function join(...parts: Stroke[]): Stroke {
  return parts.flat();
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Reparte puntos de control equidistantes a lo largo del trazo. */
export function resample(stroke: Stroke, spacing: number): Stroke {
  const result: Stroke = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const segment = distance(a, b);
    let d = spacing - carry;
    while (d <= segment) {
      const t = d / segment;
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      d += spacing;
    }
    carry = segment - (d - spacing);
  }
  const last = stroke[stroke.length - 1];
  if (distance(result[result.length - 1], last) > spacing / 3) result.push(last);
  return result;
}

/** Path SVG ("M x y L x y ...") de una lista de puntos. */
export function toSvgPath(points: Stroke): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

/**
 * Avanza el progreso de un trazo según la posición del dedo.
 * Deja saltar unos pocos puntos para que el niño no tenga que ser exacto,
 * pero obliga a seguir el sentido correcto del trazo.
 */
export function advance(
  checkpoints: Stroke,
  reached: number,
  finger: Point,
  tolerance: number,
  lookahead = 4,
): number {
  let next = reached;
  const limit = Math.min(checkpoints.length, reached + lookahead);
  for (let i = reached; i < limit; i++) {
    if (distance(checkpoints[i], finger) <= tolerance) next = i + 1;
  }
  return next;
}

import * as Haptics from 'expo-haptics';
import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { colors } from '@/lib/colors';
import { advance, resample, toSvgPath, type Point, type Stroke } from '@/lib/geometry';

const SPACING = 3; // separación entre puntos de control (en unidades de la caja de 100)
const TOLERANCE = 11; // lo lejos que puede ir el dedo del punto y seguir contando

type Props = {
  strokes: Stroke[];
  size: number;
  color: string;
  onStrokeDone?: (index: number) => void;
  onComplete: () => void;
};

/**
 * Pizarra donde el niño repasa una letra con el dedo.
 * El progreso se queda guardado aunque levante el dedo: nunca se le castiga.
 */
export function TraceBoard({ strokes, size, color, onStrokeDone, onComplete }: Props) {
  const checkpoints = useMemo(() => strokes.map((s) => resample(s, SPACING)), [strokes]);
  // Los eventos del dedo llegan más rápido que los renders: el ref tiene siempre el valor real.
  const progressRef = useRef({ strokeIndex: 0, reached: 0 });
  const [{ strokeIndex, reached }, setProgress] = useState(progressRef.current);

  const done = strokeIndex >= checkpoints.length;
  const current = checkpoints[strokeIndex];

  function handleTouch(x: number, y: number) {
    const progress = progressRef.current;
    const stroke = checkpoints[progress.strokeIndex];
    if (!stroke) return;
    const finger: Point = { x: (x / size) * 100, y: (y / size) * 100 };
    const next = advance(stroke, progress.reached, finger, TOLERANCE);
    if (next === progress.reached) return;

    if (next < stroke.length) {
      progressRef.current = { strokeIndex: progress.strokeIndex, reached: next };
      setProgress(progressRef.current);
      return;
    }

    // Trazo terminado.
    const nextStroke = progress.strokeIndex + 1;
    progressRef.current = { strokeIndex: nextStroke, reached: 0 };
    setProgress(progressRef.current);
    onStrokeDone?.(progress.strokeIndex);
    if (nextStroke >= checkpoints.length) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } else if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => handleTouch(e.x, e.y))
    .onUpdate((e) => handleTouch(e.x, e.y));

  const target = !done ? current[Math.min(reached, current.length - 1)] : null;

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.board, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Silueta gruesa de la letra */}
          {strokes.map((s, i) => (
            <Path key={`guide-${i}`} d={toSvgPath(s)} stroke={colors.guide} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          {/* Línea discontinua por el centro */}
          {strokes.map((s, i) => (
            <Path key={`dash-${i}`} d={toSvgPath(s)} stroke={colors.guideDash} strokeWidth={1.2} strokeDasharray="2.5 2.5" strokeLinecap="round" fill="none" />
          ))}
          {/* Trazos ya completados */}
          {checkpoints.slice(0, strokeIndex).map((s, i) => (
            <Path key={`done-${i}`} d={toSvgPath(s)} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          {/* Trazo en curso */}
          {!done && reached > 0 && (
            <Path d={toSvgPath(current.slice(0, reached + 1))} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          {/* Inicio de los trazos pendientes, numerados */}
          {checkpoints.map((s, i) =>
            i > strokeIndex ? (
              <Circle key={`start-${i}`} cx={s[0].x} cy={s[0].y} r={3.5} fill={colors.pending} />
            ) : null,
          )}
          {/* Punto que hay que arrastrar */}
          {target && (
            <>
              <Circle cx={target.x} cy={target.y} r={7} fill={colors.target} opacity={0.25} />
              <Circle cx={target.x} cy={target.y} r={4.5} fill={colors.target} />
              {reached === 0 && (
                <SvgText x={target.x} y={target.y + 1.9} fontSize={5.5} fontWeight="bold" fill="#fff" textAnchor="middle">
                  {strokeIndex + 1}
                </SvgText>
              )}
            </>
          )}
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.card,
    borderRadius: 32,
    overflow: 'hidden',
  },
});

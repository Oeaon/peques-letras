import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

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
  const scale = size / 100;

  return (
    <View style={[styles.shadow, { width: size, height: size }]}>
      <GestureDetector gesture={pan}>
        <View style={[styles.board, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* Pauta de cuaderno: arriba, centro y abajo */}
            <Line x1={4} x2={96} y1={10} y2={10} stroke="#F3EEF8" strokeWidth={0.6} />
            <Line x1={4} x2={96} y1={50} y2={50} stroke="#F3EEF8" strokeWidth={0.6} strokeDasharray="2 2" />
            <Line x1={4} x2={96} y1={90} y2={90} stroke="#E9E1F2" strokeWidth={0.8} />

            {/* Silueta gruesa de la letra */}
            {strokes.map((s, i) => (
              <Path key={`guide-${i}`} d={toSvgPath(s)} stroke={colors.guide} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {/* Línea discontinua por el centro */}
            {strokes.map((s, i) => (
              <Path key={`dash-${i}`} d={toSvgPath(s)} stroke={colors.guideDash} strokeWidth={1.2} strokeDasharray="2.5 2.5" strokeLinecap="round" fill="none" />
            ))}
            {/* Trazos ya completados, con un brillo encima para que parezcan de plastilina */}
            {checkpoints.slice(0, strokeIndex).map((s, i) => (
              <InkStroke key={`done-${i}`} points={s} color={color} />
            ))}
            {/* Trazo en curso */}
            {!done && reached > 0 && <InkStroke points={current.slice(0, reached + 1)} color={color} />}
            {/* Inicio de los trazos pendientes */}
            {checkpoints.map((s, i) =>
              i > strokeIndex ? <Circle key={`start-${i}`} cx={s[0].x} cy={s[0].y} r={3.5} fill={colors.pending} /> : null,
            )}
            {/* Punto que hay que arrastrar */}
            {target && (
              <>
                <Circle cx={target.x} cy={target.y} r={5.2} fill="#fff" />
                <Circle cx={target.x} cy={target.y} r={4.3} fill={colors.target} />
                {reached === 0 && (
                  <SvgText x={target.x} y={target.y + 1.9} fontSize={5.5} fontWeight="bold" fill="#fff" textAnchor="middle">
                    {strokeIndex + 1}
                  </SvgText>
                )}
              </>
            )}
          </Svg>

          {target && <Pulse x={target.x * scale} y={target.y * scale} radius={9 * scale} />}
          {target && strokeIndex === 0 && reached === 0 && <HandHint x={target.x * scale} y={target.y * scale} size={size} />}
        </View>
      </GestureDetector>
    </View>
  );
}

function InkStroke({ points, color }: { points: Stroke; color: string }) {
  const d = toSvgPath(points);
  return (
    <>
      <Path d={d} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path
        d={d}
        stroke="#fff"
        strokeOpacity={0.35}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform="translate(-1.3 -1.3)"
      />
    </>
  );
}

/** Anillo que late alrededor del punto verde para llamar la atención. */
function Pulse({ x, y, radius }: { x: number; y: number; radius: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 0.6 + t.value * 0.9 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        { left: x - radius, top: y - radius, width: radius * 2, height: radius * 2, borderRadius: radius },
        style,
      ]}
    />
  );
}

/** Manita que indica dónde empezar, solo al principio. */
function HandHint({ x, y, size }: { x: number; y: number; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })), -1, false);
  }, [t]);
  const fontSize = size * 0.11;
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * 8 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.hand, { left: x - fontSize * 0.35, top: y + size * 0.04 }, style]}>
      <Text style={{ fontSize }}>👆</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 32,
    backgroundColor: colors.card,
    shadowColor: '#3B2F4A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  board: {
    backgroundColor: colors.card,
    borderRadius: 32,
    overflow: 'hidden',
  },
  pulse: { position: 'absolute', backgroundColor: colors.target },
  hand: { position: 'absolute' },
});

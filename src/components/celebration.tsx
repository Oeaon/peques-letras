import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  BounceIn,
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { colors, fonts, palette } from '@/lib/colors';

type Props = {
  width: number;
  height: number;
  color: string;
  emoji: string;
  say: string;
};

export function Celebration({ width, height, color, emoji, say }: Props) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 350,
        duration: 1500 + Math.random() * 1100,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
        color: palette[i % palette.length],
        w: 8 + Math.random() * 6,
        h: 12 + Math.random() * 8,
        round: i % 3 === 0,
      })),
    [width],
  );

  return (
    <View style={[styles.overlay, { width, height }]}>
      <Animated.Text entering={ZoomIn.springify().damping(9)} style={[styles.emoji, { fontSize: width * 0.32 }]}>
        {emoji}
      </Animated.Text>
      <View style={styles.stars}>
        {[0, 1, 2].map((i) => (
          <Animated.Text key={i} entering={BounceIn.delay(250 + i * 180)} style={[styles.star, i === 1 && styles.starBig]}>
            ★
          </Animated.Text>
        ))}
      </View>
      <Animated.Text entering={FadeInUp.delay(300)} style={[styles.cheer, { color }]}>
        ¡Muy bien!
      </Animated.Text>
      <Animated.Text entering={FadeInUp.delay(450)} style={styles.say}>
        {say}
      </Animated.Text>

      {pieces.map((p, i) => (
        <Confetti key={i} {...p} fall={height + 40} />
      ))}
    </View>
  );
}

function Confetti({
  x,
  delay,
  duration,
  spin,
  color,
  w,
  h,
  round,
  fall,
}: {
  x: number;
  delay: number;
  duration: number;
  spin: number;
  color: string;
  w: number;
  h: number;
  round: boolean;
  fall: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
  }, [t, delay, duration]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
    transform: [{ translateY: -30 + t.value * fall }, { translateX: Math.sin(t.value * 6) * 14 }, { rotate: `${t.value * spin}deg` }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.piece, { left: x, width: w, height: round ? w : h, borderRadius: round ? w / 2 : 2, backgroundColor: color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: { textAlign: 'center' },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 },
  star: { fontSize: 40, color: colors.star, textShadowColor: 'rgba(0,0,0,0.12)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
  starBig: { fontSize: 56 },
  cheer: { fontFamily: fonts.bold, fontSize: 46, marginTop: 4 },
  say: { fontFamily: fonts.regular, fontSize: 26, color: colors.text },
  piece: { position: 'absolute', top: 0 },
});

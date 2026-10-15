import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Celebration } from '@/components/celebration';
import { TraceBoard } from '@/components/trace-board';
import { ALL_GLYPHS, findGlyph, nextGlyph } from '@/data/glyphs';
import { maybeShowInterstitial, registerCompletion } from '@/lib/ads';
import { colorFor, colors, darken, fonts, tint } from '@/lib/colors';
import { markCompleted } from '@/lib/progress';

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'es-ES', rate: 0.85, pitch: 1.1 });
}

export default function TraceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const glyph = findGlyph(id);
  const { width, height } = useWindowDimensions();
  const [attempt, setAttempt] = useState(0);
  const [strokesDone, setStrokesDone] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (glyph) speak(glyph.kind === 'letra' ? `Traza la ${glyph.char}` : `Traza el ${glyph.say}`);
    return () => {
      Speech.stop();
    };
  }, [glyph]);

  if (!glyph) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.word}>No encontrado</Text>
      </SafeAreaView>
    );
  }

  const color = colorFor(ALL_GLYPHS.indexOf(glyph));
  // En el renderizado estático de web la ventana mide 0: evitamos tamaños negativos.
  const boardSize = Math.max(Math.min(width - 32, height * 0.58, 520), 100);
  const word = glyph.say.split(' de ').pop() ?? glyph.say;

  function handleComplete() {
    setFinished(true);
    markCompleted(glyph!.id);
    registerCompletion();
    speak(`¡Muy bien! ${glyph!.say}`);
  }

  function repeat() {
    maybeShowInterstitial();
    setFinished(false);
    setStrokesDone(0);
    setAttempt((a) => a + 1);
  }

  function goNext() {
    maybeShowInterstitial();
    router.replace({ pathname: '/trazar/[id]', params: { id: nextGlyph(glyph!).id } });
  }

  return (
    <LinearGradient colors={[tint(color, 0.88), tint(color, 0.72)]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <RoundButton label="←" onPress={() => router.back()} accessibilityLabel="Volver" />
          <Animated.View entering={FadeInDown.springify()} style={styles.titleBox}>
            <Text style={[styles.char, { color, textShadowColor: darken(color, 0.3) }]}>{glyph.char}</Text>
            {glyph.kind === 'letra' && (
              <Text style={styles.word}>
                {glyph.emoji} {word}
              </Text>
            )}
          </Animated.View>
          <RoundButton label="🔊" onPress={() => speak(glyph.say)} accessibilityLabel="Escuchar" />
        </View>

        <View style={styles.boardArea}>
          <View style={{ width: boardSize, height: boardSize }}>
            <TraceBoard
              key={`${glyph.id}-${attempt}`}
              strokes={glyph.strokes}
              size={boardSize}
              color={color}
              onStrokeDone={(i) => setStrokesDone(i + 1)}
              onComplete={handleComplete}
            />
            {finished && <Celebration width={boardSize} height={boardSize} color={color} emoji={glyph.emoji} say={glyph.say} />}
          </View>

          {glyph.strokes.length > 1 && (
            <View style={styles.dots}>
              {glyph.strokes.map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i < strokesDone ? color : 'rgba(255,255,255,0.8)' }]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {finished ? (
            <Animated.View entering={FadeIn.delay(400)} style={styles.footerRow}>
              <Pressable onPress={repeat} style={({ pressed }) => [styles.button, styles.buttonSoft, pressed && styles.pressed]}>
                <Text style={[styles.buttonText, { color: colors.text }]}>↺ Otra vez</Text>
              </Pressable>
              <Pressable
                onPress={goNext}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: color, borderBottomColor: darken(color) },
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.buttonText}>Siguiente →</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.hintPill}>
              <Text style={styles.hint}>Sigue el punto verde con el dedo</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function RoundButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
      <Text style={styles.roundButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleBox: { alignItems: 'center' },
  char: {
    fontFamily: fonts.bold,
    fontSize: 64,
    lineHeight: 72,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  word: { fontFamily: fonts.regular, fontSize: 20, color: colors.text, marginTop: -4 },
  roundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#E6DEEF',
  },
  roundButtonText: { fontSize: 26, color: colors.text, fontFamily: fonts.bold },
  boardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 16 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  footer: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerRow: { flexDirection: 'row', gap: 16, width: '100%', justifyContent: 'center' },
  hintPill: { backgroundColor: 'rgba(255,255,255,0.75)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  hint: { fontFamily: fonts.regular, fontSize: 18, color: colors.text, textAlign: 'center' },
  button: {
    flex: 1,
    maxWidth: 240,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#E6DEEF',
  },
  buttonSoft: { backgroundColor: colors.card },
  buttonText: { fontSize: 22, fontFamily: fonts.bold, color: '#fff' },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
});

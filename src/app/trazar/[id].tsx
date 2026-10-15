import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TraceBoard } from '@/components/trace-board';
import { ALL_GLYPHS, findGlyph, nextGlyph } from '@/data/glyphs';
import { colorFor, colors } from '@/lib/colors';

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'es-ES', rate: 0.85, pitch: 1.1 });
}

export default function TraceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const glyph = findGlyph(id);
  const { width, height } = useWindowDimensions();
  const [attempt, setAttempt] = useState(0);
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
        <Text style={styles.title}>No encontrado</Text>
      </SafeAreaView>
    );
  }

  const color = colorFor(ALL_GLYPHS.indexOf(glyph));
  // En el renderizado estático de web la ventana mide 0: evitamos tamaños negativos.
  const boardSize = Math.max(Math.min(width - 32, height * 0.62, 520), 100);

  function handleComplete() {
    setFinished(true);
    speak(`¡Muy bien! ${glyph!.say}`);
  }

  function repeat() {
    setFinished(false);
    setAttempt((a) => a + 1);
  }

  function goNext() {
    router.replace({ pathname: '/trazar/[id]', params: { id: nextGlyph(glyph!).id } });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel="Volver">
          <Text style={styles.roundButtonText}>←</Text>
        </Pressable>
        <Text style={[styles.title, { color }]}>{glyph.char}</Text>
        <Pressable onPress={() => speak(glyph.say)} style={styles.roundButton} accessibilityLabel="Escuchar">
          <Text style={styles.roundButtonText}>🔊</Text>
        </Pressable>
      </View>

      <View style={styles.boardArea}>
        <TraceBoard key={`${glyph.id}-${attempt}`} strokes={glyph.strokes} size={boardSize} color={color} onComplete={handleComplete} />

        {finished && (
          <View style={[styles.celebration, { width: boardSize, height: boardSize }]}>
            <Text style={styles.emoji}>{glyph.emoji}</Text>
            <Text style={[styles.cheer, { color }]}>¡Muy bien!</Text>
            <Text style={styles.say}>{glyph.say}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {finished ? (
          <>
            <Pressable onPress={repeat} style={[styles.button, styles.buttonSoft]}>
              <Text style={[styles.buttonText, { color: colors.text }]}>↺ Otra vez</Text>
            </Pressable>
            <Pressable onPress={goNext} style={[styles.button, { backgroundColor: color }]}>
              <Text style={styles.buttonText}>Siguiente →</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.hint}>Arrastra el punto verde siguiendo la línea</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { fontSize: 56, fontWeight: '900', color: colors.text },
  roundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonText: { fontSize: 26, color: colors.text },
  boardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  celebration: {
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: { fontSize: 120 },
  cheer: { fontSize: 44, fontWeight: '900' },
  say: { fontSize: 26, fontWeight: '700', color: colors.text },
  footer: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hint: { fontSize: 18, color: colors.textSoft, textAlign: 'center' },
  button: { flex: 1, maxWidth: 240, paddingVertical: 18, borderRadius: 24, alignItems: 'center' },
  buttonSoft: { backgroundColor: colors.card },
  buttonText: { fontSize: 22, fontWeight: '800', color: '#fff' },
});

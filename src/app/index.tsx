import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ALL_GLYPHS, LETTERS, NUMBERS, type Glyph } from '@/data/glyphs';
import { colorFor, colors } from '@/lib/colors';

function GlyphTile({ glyph }: { glyph: Glyph }) {
  const color = colorFor(ALL_GLYPHS.indexOf(glyph));
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/trazar/[id]', params: { id: glyph.id } })}
      accessibilityRole="button"
      accessibilityLabel={glyph.say}
      style={({ pressed }) => [styles.tile, { backgroundColor: color }, pressed && styles.tilePressed]}>
      <Text style={styles.tileText}>{glyph.char}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Peques</Text>
        <Text style={styles.subtitle}>¿Qué quieres aprender hoy?</Text>

        <Text style={styles.section}>🔤 Letras</Text>
        <View style={styles.grid}>
          {LETTERS.map((g) => (
            <GlyphTile key={g.id} glyph={g} />
          ))}
        </View>

        <Text style={styles.section}>🔢 Números</Text>
        <View style={styles.grid}>
          {NUMBERS.map((g) => (
            <GlyphTile key={g.id} glyph={g} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  title: { fontSize: 48, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 20, color: colors.textSoft, textAlign: 'center', marginBottom: 8 },
  section: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tile: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePressed: { transform: [{ scale: 0.92 }] },
  tileText: { fontSize: 38, fontWeight: '900', color: '#fff' },
});

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/ad-banner';
import { adsAvailable } from '@/lib/ads';
import { GlyphTile } from '@/components/glyph-tile';
import { ALL_GLYPHS, LETTERS, NUMBERS } from '@/data/glyphs';
import { colorFor, colors, fonts, palette } from '@/lib/colors';
import { useProgress } from '@/lib/progress';

const TITLE = 'Peques';
const GAP = 14;

type Tab = 'letras' | 'numeros';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const progress = useProgress();
  const [tab, setTab] = useState<Tab>('letras');

  const contentWidth = Math.min(width, 720) - 32;
  const columns = contentWidth > 560 ? 6 : 4;
  const tileSize = Math.floor((contentWidth - GAP * (columns - 1)) / columns);

  const list = tab === 'letras' ? LETTERS : NUMBERS;
  const doneCount = ALL_GLYPHS.filter((g) => progress[g.id]).length;
  const doneRatio = doneCount / ALL_GLYPHS.length;

  return (
    <LinearGradient colors={[colors.background, colors.backgroundEnd]} style={styles.screen}>
      {/* Burbujas decorativas de fondo */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.bubble, { top: -60, left: -50, width: 180, height: 180, backgroundColor: '#FFD6A5' }]} />
        <View style={[styles.bubble, { top: 120, right: -70, width: 160, height: 160, backgroundColor: '#CDE7FF' }]} />
        <View style={[styles.bubble, { bottom: 80, left: -40, width: 140, height: 140, backgroundColor: '#E5D4FF' }]} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()} style={styles.titleRow}>
            {TITLE.split('').map((ch, i) => (
              <Text
                key={i}
                style={[styles.titleLetter, { color: palette[i % palette.length], transform: [{ rotate: i % 2 ? '6deg' : '-6deg' }] }]}>
                {ch}
              </Text>
            ))}
          </Animated.View>
          <Text style={styles.subtitle}>¿Qué quieres aprender hoy?</Text>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.progressCard}>
            <Text style={styles.progressStar}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressText}>
                {doneCount} de {ALL_GLYPHS.length} conseguidas
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(doneRatio * 100, 3)}%` }]} />
              </View>
            </View>
          </Animated.View>

          <View style={styles.tabs}>
            <TabButton label="ABC" caption="Letras" active={tab === 'letras'} color="#FF6B6B" onPress={() => setTab('letras')} />
            <TabButton label="123" caption="Números" active={tab === 'numeros'} color="#4D7CFE" onPress={() => setTab('numeros')} />
          </View>

          <View key={tab} style={[styles.grid, { gap: GAP }]}>
            {list.map((g, i) => (
              <GlyphTile
                key={g.id}
                glyph={g}
                index={i}
                size={tileSize}
                color={colorFor(ALL_GLYPHS.indexOf(g))}
                done={!!progress[g.id]}
                onPress={() => router.push({ pathname: '/trazar/[id]', params: { id: g.id } })}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={adsAvailable ? styles.adArea : undefined}>
        <AdBanner />
      </SafeAreaView>
    </LinearGradient>
  );
}

function TabButton({
  label,
  caption,
  active,
  color,
  onPress,
}: {
  label: string;
  caption: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tab, active ? { backgroundColor: color } : styles.tabInactive]}>
      <Text style={[styles.tabLabel, { color: active ? '#fff' : color }]}>{label}</Text>
      <Text style={[styles.tabCaption, { color: active ? '#fff' : colors.textSoft }]}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  bubble: { position: 'absolute', borderRadius: 999, opacity: 0.45 },
  content: { padding: 16, paddingBottom: 32, maxWidth: 720, width: '100%', alignSelf: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  titleLetter: {
    fontFamily: fonts.bold,
    fontSize: 58,
    marginHorizontal: 1,
    textShadowColor: 'rgba(59,47,74,0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: { fontFamily: fonts.regular, fontSize: 20, color: colors.textSoft, textAlign: 'center', marginTop: -4 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 14,
    marginTop: 18,
    shadowColor: '#3B2F4A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressStar: { fontSize: 34 },
  progressText: { fontFamily: fonts.bold, fontSize: 17, color: colors.text, marginBottom: 6 },
  progressTrack: { height: 12, borderRadius: 6, backgroundColor: '#F1ECF7', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: colors.star },
  tabs: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 18 },
  tab: { flex: 1, borderRadius: 22, paddingVertical: 10, alignItems: 'center' },
  tabInactive: { backgroundColor: colors.card },
  tabLabel: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 30 },
  tabCaption: { fontFamily: fonts.regular, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingTop: 6 },
  adArea: { backgroundColor: '#fff' },
});

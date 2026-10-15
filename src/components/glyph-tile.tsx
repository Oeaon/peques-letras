import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { Glyph } from '@/data/glyphs';
import { colors, darken, fonts } from '@/lib/colors';

type Props = {
  glyph: Glyph;
  color: string;
  size: number;
  done: boolean;
  index: number;
  onPress: () => void;
};

export function GlyphTile({ glyph, color, size, done, index, onPress }: Props) {
  return (
    <Animated.View entering={ZoomIn.delay(index * 25).springify().damping(14)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={glyph.say}
        style={({ pressed }) => [
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderBottomColor: darken(color),
            borderBottomWidth: pressed ? 2 : 6,
            transform: [{ translateY: pressed ? 4 : 0 }],
          },
        ]}>
        <Text style={[styles.char, { fontSize: size * 0.52 }]}>{glyph.char}</Text>
        <Text style={[styles.emoji, { fontSize: size * 0.2 }]}>{glyph.emoji}</Text>
        {done && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontFamily: fonts.bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
    marginTop: -6,
  },
  emoji: { position: 'absolute', bottom: 4, right: 6 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.star,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 14, lineHeight: 16, fontFamily: fonts.bold },
});

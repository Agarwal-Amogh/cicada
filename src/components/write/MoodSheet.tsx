import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { reduceFade, springs } from '@/theme/motionCurves';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { fonts, radius, space, type, useColors } from '@/theme/tokens';

const MOODS = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];
const SHEET_HEIGHT = 260;

type Props = {
  open: boolean;
  onPick: (mood: number | null) => void;
  /** Called once the sheet has fully gone. */
  onClosed: () => void;
};

// The optional one-tap mood on save (Board 1, 2C). The only thing Cicada ever
// asks, and Skip is always there. Rises its own height (Motion rule 19); the
// dim follows how open it is.
export function MoodSheet({ open, onPick, onClosed }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const done = (finished?: boolean) => {
      'worklet';
      if (finished && !open) runOnJS(onClosed)();
    };
    if (reduceMotion) progress.value = withTiming(open ? 1 : 0, open ? reduceFade.in : reduceFade.out, done);
    else progress.value = withSpring(open ? 1 : 0, open ? springs.sheetIn : springs.sheetOut, done);
  }, [open, reduceMotion, progress, onClosed]);

  const scrim = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheet = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: progress.value }
      : { transform: [{ translateY: (1 - progress.value) * (SHEET_HEIGHT + insets.bottom) }] },
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrim]}>
        <PressableScale style={StyleSheet.absoluteFill} onPress={() => onPick(null)} accessibilityLabel="Skip" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, paddingBottom: insets.bottom + space.lg, marginHorizontal: space.sm },
          sheet,
        ]}>
        <Text style={[type.headline, { color: colors.text }]}>How did today feel?</Text>
        <Text style={[type.caption, { color: colors.textSecondary }]}>Optional. One tap.</Text>
        <View style={styles.row}>
          {MOODS.map((m) => (
            <PressableScale
              key={m.value}
              onPress={() => onPick(m.value)}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              style={styles.mood}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.accent, opacity: 0.25 + (m.value - 1) * 0.1875 },
                ]}
              />
              <Text style={[type.caption, { color: colors.textSecondary }]}>{m.label}</Text>
            </PressableScale>
          ))}
        </View>
        <PressableScale onPress={() => onPick(null)} accessibilityRole="button" style={styles.skip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.sm,
    borderRadius: radius.lg + 8,
    paddingTop: space.xl,
    paddingHorizontal: space.xl,
    gap: space.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.lg, marginBottom: space.sm },
  mood: { alignItems: 'center', gap: space.sm, minWidth: 48 },
  dot: { width: 40, height: 40, borderRadius: 20 },
  skip: { alignSelf: 'center', paddingVertical: space.md, paddingHorizontal: space.xl },
  skipText: { fontFamily: fonts.semibold, fontSize: 15 },
});

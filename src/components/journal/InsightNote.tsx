import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import type { WeekNote } from '@/insights/weekNote';
import { riseIn } from '@/theme/motionCurves';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { radius, space, type, useColors } from '@/theme/tokens';

// The one quiet note above the entries (Board 2, 3A): the "smart person"
// speaking up. Rises in once; still with reduce motion.
export function InsightNote({ note, onSeeWhy }: { note: WeekNote; onSeeWhy: () => void }) {
  const colors = useColors();
  const reduceMotion = useReduceMotion();
  return (
    <Animated.View entering={reduceMotion ? undefined : riseIn(120)}>
      <PressableScale
        onPress={onSeeWhy}
        accessibilityRole="button"
        accessibilityHint="Opens the patterns behind this note"
        style={[styles.note, { backgroundColor: colors.accentTint }]}>
        <Text style={[type.label, { color: colors.accent }]}>{note.label.toUpperCase()}</Text>
        <Text style={[type.entry, { color: colors.text }]}>{note.sentence}</Text>
        <Text style={[type.callout, { color: colors.accent }]}>See why ›</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: radius.lg, padding: space.lg, gap: space.xs },
});

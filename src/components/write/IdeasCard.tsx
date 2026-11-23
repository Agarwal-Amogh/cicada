import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { riseIn, sinkOut } from '@/theme/motionCurves';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { radius, space, type, useColors } from '@/theme/tokens';

// Three things to write about, shown above the toolbar when ✦ is tapped
// (Board 2, 2A). Tapping one puts it in the title; nobody talks back.
export function IdeasCard({ ideas, onPick }: { ideas: string[]; onPick: (idea: string) => void }) {
  const colors = useColors();
  const reduceMotion = useReduceMotion();
  return (
    <Animated.View
      entering={reduceMotion ? undefined : riseIn()}
      exiting={reduceMotion ? undefined : sinkOut}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <Text style={[type.label, { color: colors.textSecondary }]}>SOMETHING TO WRITE ABOUT</Text>
      {ideas.map((idea, i) => (
        <View key={idea}>
          {i > 0 && <View style={[styles.hair, { backgroundColor: colors.line }]} />}
          <PressableScale onPress={() => onPick(idea)} accessibilityRole="button" style={styles.idea}>
            <Text style={[type.entrySmall, { color: colors.text }]}>{idea}</Text>
          </PressableScale>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, paddingBottom: space.sm },
  idea: { paddingVertical: space.md },
  hair: { height: StyleSheet.hairlineWidth },
});

import { StyleSheet, Text, View } from 'react-native';

import type { ChartSpec } from '@/insights/chartData';
import type { Pattern } from '@/insights/patterns';
import { radius, space, type, useColors } from '@/theme/tokens';

import { PatternChart } from './PatternChart';

// One pattern on You: its title, the plain sentence, how often it held, and
// its chart when it has one. The caption is the sentence, so the chart always
// says what it shows.
export function PatternCard({ pattern, chart }: { pattern: Pattern; chart: ChartSpec | null }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.head}>
        <Text style={[type.headline, styles.title, { color: colors.text }]}>{pattern.title}</Text>
        <Text style={[type.caption, { color: colors.textSecondary }]}>
          {pattern.held} of {pattern.of}
        </Text>
      </View>
      <Text style={[type.entrySmall, { color: colors.text }]}>{pattern.sentence}</Text>
      {chart && <PatternChart spec={chart} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  title: { flex: 1 },
});

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { PatternChart } from '@/components/you/PatternChart';
import { formatDay } from '@/domain/dates';
import { type ChartSpec, formatSignal } from '@/insights/chartData';
import type { Pattern, Receipt } from '@/insights/patterns';
import { fonts, radius, space, type, useColors } from '@/theme/tokens';

const KIND_LABEL: Record<Pattern['kind'], string> = {
  'short-sleep': 'Sleep and mood',
  'late-screen-sleep': 'Phone and sleep',
  'active-days': 'Movement and mood',
  person: 'People',
  trigger: 'What weighs on you',
};

function receiptValue(p: Pattern, r: Receipt): string | null {
  if (r.value === null) return null;
  if (p.chart === 'sleepMinutes') return formatSignal({ barLabel: 'hours slept' }, r.value / 60);
  if (p.chart === 'steps') return formatSignal({ barLabel: 'steps' }, r.value);
  if (p.chart === 'lateScreenMinutes') return formatSignal({ barLabel: 'late' }, r.value);
  return null;
}

type Props = {
  pattern: Pattern;
  chart: ChartSpec | null;
  index: number;
  count: number;
  dismissed: boolean;
  onDismiss: () => void;
};

// One pattern, full screen (Board 2, 5A flashcards): the claim in big type,
// its chart, the receipts (the days behind it), and "Not true for me".
export function PatternFlashcard({ pattern, chart, index, count, dismissed, onDismiss }: Props) {
  const colors = useColors();
  const [showAll, setShowAll] = useState(false);
  const receipts = showAll ? pattern.receipts : pattern.receipts.slice(-4).reverse();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[type.caption, { color: colors.textSecondary }]}>
          {index + 1} of {count} · {KIND_LABEL[pattern.kind]}
        </Text>
        <Text style={[styles.claim, { color: colors.text }]}>{pattern.title}</Text>
        <Text style={[type.entry, { color: colors.text }]}>{pattern.sentence}</Text>

        {chart && <PatternChart spec={chart} />}

        <View style={[styles.receipts, { borderColor: colors.line }]}>
          <Text style={[type.label, { color: colors.textSecondary }]}>
            THE DAYS BEHIND IT · HELD {pattern.held} OF {pattern.of}
          </Text>
          {receipts.map((r) => (
            <View key={r.day} style={styles.receipt}>
              <View style={styles.receiptHead}>
                <Text style={[type.callout, { color: colors.text }]}>{formatDay(r.day)}</Text>
                {receiptValue(pattern, r) && (
                  <Text style={[type.caption, { color: colors.textSecondary }]}>{receiptValue(pattern, r)}</Text>
                )}
              </View>
              {r.excerpt && (
                <Text style={[type.entrySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                  “{r.excerpt}”
                </Text>
              )}
            </View>
          ))}
          {pattern.receipts.length > 4 && (
            <PressableScale onPress={() => setShowAll((s) => !s)} accessibilityRole="button" style={styles.more}>
              <Text style={[type.callout, { color: colors.accent }]}>
                {showAll ? 'Show fewer' : `Show all ${pattern.receipts.length} days`}
              </Text>
            </PressableScale>
          )}
        </View>

        <View style={[styles.experiment, { borderColor: colors.line }]}>
          <Text style={[type.label, { color: colors.textSecondary }]}>TRY THIS WEEK</Text>
          <Text style={[type.callout, { color: colors.text }]}>{pattern.experiment}</Text>
        </View>

        <PressableScale
          onPress={onDismiss}
          disabled={dismissed}
          accessibilityRole="button"
          style={styles.notTrue}>
          <Text style={[styles.notTrueText, { color: colors.textSecondary }]}>
            {dismissed ? 'Noted. Cicada will weigh this less.' : 'Not true for me'}
          </Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg + 8, overflow: 'hidden' },
  content: { padding: space.xl, gap: space.md },
  claim: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  receipts: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.md, gap: space.md, marginTop: space.sm },
  receipt: { gap: 2 },
  receiptHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm },
  more: { alignSelf: 'flex-start', paddingVertical: space.xs },
  experiment: { borderWidth: 1, borderRadius: radius.md, padding: space.md, gap: space.xs },
  notTrue: { alignSelf: 'center', paddingVertical: space.md, paddingHorizontal: space.lg },
  notTrueText: { fontFamily: fonts.medium, fontSize: 14 },
});

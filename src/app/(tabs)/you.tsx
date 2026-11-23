import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT, tabBarBottom } from '@/components/AppTabs';
import { PressableScale } from '@/components/PressableScale';
import { MoodGrid } from '@/components/you/MoodGrid';
import { PatternCard } from '@/components/you/PatternCard';
import { useDays, useEntries } from '@/data/DataProvider';
import { addDays, dayKey, shortDate } from '@/domain/dates';
import { chartSpec } from '@/insights/chartData';
import { dailyRows } from '@/insights/dailyRows';
import { findPatterns } from '@/insights/patterns';
import { PATTERN_WINDOW_DAYS } from '@/insights/weekNote';
import { lastFullWeek, weeklyLetter } from '@/insights/weeklyLetter';
import { radius, space, type, useColors } from '@/theme/tokens';

/** Days of writing before Cicada expects to have seen enough (the learning period). */
const LEARNING_DAYS = 14;

// The You screen (Decision 0009): the month's mood at a glance, then one card
// per solid pattern, each chart tied to what it shows. Until patterns exist,
// a quiet first-person note says Cicada is still learning.
export default function YouScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const entries = useEntries();
  const today = useMemo(() => dayKey(new Date()), []);
  const from = addDays(today, -(PATTERN_WINDOW_DAYS - 1));
  const days = useDays(from, today);

  const { patterns, rows } = useMemo(() => {
    if (!entries || !days) return { patterns: [], rows: [] };
    return { patterns: findPatterns(entries, days, from, today), rows: dailyRows(entries, days) };
  }, [entries, days, from, today]);
  const letter = useMemo(
    () => (entries && days ? weeklyLetter(entries, days, today) : null),
    [entries, days, today],
  );
  const week = lastFullWeek(today);
  const daysWritten = useMemo(
    () => new Set((entries ?? []).filter((e) => e.day >= from).map((e) => e.day)).size,
    [entries, from],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.xl,
          paddingBottom: tabBarBottom(insets.bottom) + TAB_BAR_HEIGHT + space.xl,
          paddingHorizontal: space.lg,
          gap: space.md,
        }}>
        <Text style={[type.largeTitle, { color: colors.text }]} accessibilityRole="header">
          You
        </Text>

        {entries && patterns.length === 0 && (
          <View style={[styles.note, { backgroundColor: colors.accentTint }]}>
            <Text style={[type.label, { color: colors.accent }]}>LEARNING</Text>
            <Text style={[type.entry, { color: colors.text }]}>
              {"I'm learning your patterns. I'll tell you when I notice something real."}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.fill,
                  { backgroundColor: colors.accent, width: `${Math.min(1, daysWritten / LEARNING_DAYS) * 100}%` },
                ]}
              />
            </View>
            <Text style={[type.caption, { color: colors.textSecondary }]}>
              {Math.min(daysWritten, LEARNING_DAYS)} of {LEARNING_DAYS} days written
            </Text>
          </View>
        )}

        {letter && letter.paragraphs.length > 0 && (
          <PressableScale
            onPress={() => router.push('/report')}
            accessibilityRole="button"
            accessibilityHint="Opens this week's letter"
            style={[styles.note, { backgroundColor: colors.accentTint }]}>
            <Text style={[type.label, { color: colors.accent }]}>
              YOUR WEEK · {shortDate(week.from).toUpperCase()} – {shortDate(week.to).toUpperCase()}
            </Text>
            <Text style={[type.entry, { color: colors.text }]} numberOfLines={3}>
              {letter.paragraphs[0]}
            </Text>
            <Text style={[type.callout, { color: colors.accent }]}>Read the letter ›</Text>
          </PressableScale>
        )}

        {entries && <MoodGrid entries={entries} today={today} />}

        {patterns.length > 0 && (
          <Text style={[type.caption, styles.section, { color: colors.textSecondary }]}>
            PATTERNS FROM THE LAST FOUR WEEKS
          </Text>
        )}
        {patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} chart={chartSpec(p, rows, from, today)} />
        ))}
      </ScrollView>
      <View
        pointerEvents="none"
        style={[styles.statusBar, { height: insets.top, backgroundColor: colors.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  note: { padding: space.lg, borderRadius: radius.lg, gap: space.sm },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: space.xs },
  fill: { height: 4, borderRadius: 2 },
  section: { marginTop: space.md, letterSpacing: 0.6 },
});

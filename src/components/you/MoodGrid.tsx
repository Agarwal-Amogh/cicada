import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { dayOfMonth, formatEntryTime, monthTitle } from '@/domain/dates';
import type { DayKey, EntryWithTags } from '@/domain/types';
import { type GridCell, moodGrid, shiftMonth } from '@/insights/moodGrid';
import { radius, space, type, useColors } from '@/theme/tokens';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MOOD_WORDS = ['Rough', 'Low', 'Okay', 'Good', 'Great'];

// Mood across the month (Board 2, 4C): one hue, light to dark (dataviz:
// sequential = one hue). Darker sage is a better day; an outline is a day
// with nothing written. Tap a day to read it.
export function MoodGrid({ entries, today }: { entries: EntryWithTags[]; today: DayKey }) {
  const colors = useColors();
  const [month, setMonth] = useState(() => `${today.slice(0, 7)}-01`);
  const [picked, setPicked] = useState<GridCell | null>(null);
  const weeks = moodGrid(month, entries, today);
  const canGoForward = month < `${today.slice(0, 7)}-01`;
  // Roughest days still read as filled, apart from the empty outline of a blank day.
  const opacity = (mood: number) => 0.3 + ((mood + 2) / 4) * 0.7;

  const pickedEntry = picked ? entries.find((e) => e.day === picked.day) : undefined;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.head}>
        <Text style={[type.headline, { color: colors.text }]}>Mood · {monthTitle(month)}</Text>
        <View style={styles.nav}>
          <NavButton label="Previous month" onPress={() => setMonth(shiftMonth(month, -1))} glyph="‹" />
          <NavButton
            label="Next month"
            disabled={!canGoForward}
            onPress={() => setMonth(shiftMonth(month, 1))}
            glyph="›"
          />
        </View>
      </View>

      <View style={styles.row}>
        {LETTERS.map((l, i) => (
          <Text key={i} style={[type.caption, styles.letter, { color: colors.textSecondary }]}>
            {l}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].day} style={styles.row}>
          {week.map((c) => (
            <PressableScale
              key={c.day}
              disabled={!c.inMonth || c.isFuture}
              onPress={() => setPicked(picked?.day === c.day ? null : c)}
              accessibilityRole="button"
              accessibilityLabel={`${c.day}: ${c.mood === null ? 'nothing written' : MOOD_WORDS[Math.round(c.mood) + 2]}`}
              style={styles.cellHit}>
              <View
                style={[
                  styles.cell,
                  c.mood === null
                    ? { borderWidth: 1, borderColor: colors.line }
                    : { backgroundColor: colors.accent, opacity: opacity(c.mood) },
                  // Last, so they win: days outside the month vanish, future days are faint.
                  c.isFuture && { opacity: 0.35 },
                  !c.inMonth && { opacity: 0 },
                  c.isToday && { borderWidth: 2, borderColor: colors.text },
                  picked?.day === c.day && { borderWidth: 2, borderColor: colors.text },
                ]}
              />
            </PressableScale>
          ))}
        </View>
      ))}

      <View style={styles.legend} accessible accessibilityLabel="Lighter is a rougher day, darker a better one">
        <Text style={[type.caption, { color: colors.textSecondary }]}>Rough</Text>
        {[-2, -1, 0, 1, 2].map((m) => (
          <View key={m} style={[styles.swatch, { backgroundColor: colors.accent, opacity: opacity(m) }]} />
        ))}
        <Text style={[type.caption, { color: colors.textSecondary }]}>Great</Text>
        <View style={[styles.swatch, { borderWidth: 1, borderColor: colors.line, marginLeft: space.md }]} />
        <Text style={[type.caption, { color: colors.textSecondary }]}>Not written</Text>
      </View>

      {picked && (
        <View style={[styles.picked, { borderTopColor: colors.line }]}>
          <Text style={[type.caption, { color: colors.textSecondary }]}>
            {pickedEntry ? formatEntryTime(pickedEntry.createdAt) : `${dayOfMonth(picked.day)} ${monthTitle(picked.day)}`}
          </Text>
          <Text style={[type.entrySmall, { color: colors.text }]} numberOfLines={3}>
            {pickedEntry?.body ?? 'Nothing written this day.'}
          </Text>
        </View>
      )}
    </View>
  );
}

function NavButton({ label, glyph, onPress, disabled }: { label: string; glyph: string; onPress: () => void; disabled?: boolean }) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.navButton, { backgroundColor: colors.elevated, opacity: disabled ? 0.4 : 1 }]}>
      <Text style={[type.headline, { color: colors.text }]}>{glyph}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.xs },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  nav: { flexDirection: 'row', gap: space.sm },
  navButton: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 4 },
  letter: { flex: 1, textAlign: 'center' },
  cellHit: { flex: 1 },
  cell: { aspectRatio: 1, borderRadius: 6 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm, flexWrap: 'wrap' },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  picked: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: space.sm, paddingTop: space.sm, gap: space.xs },
});

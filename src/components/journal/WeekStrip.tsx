import { StyleSheet, Text, View } from 'react-native';

import { dayOfMonth, weekdayLetter } from '@/domain/dates';
import type { WeekDay } from '@/domain/journalSections';
import { fonts, space, type, useColors } from '@/theme/tokens';

const SIZE = 34;

// This week, Monday to Sunday (Board 1, 1C). A filled circle is a day you
// wrote; a ring is today, not written yet. Future days are faint.
export function WeekStrip({ days }: { days: WeekDay[] }) {
  const colors = useColors();
  const written = days.filter((d) => d.written).length;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`This week: you wrote on ${written} of ${days.filter((d) => !d.isFuture).length} days so far`}>
      {days.map((d) => {
        const fill = d.written ? colors.accent : 'transparent';
        const border = d.written ? colors.accent : d.isToday ? colors.accent : colors.line;
        const numberColor = d.written ? colors.onAccent : d.isFuture ? colors.textSecondary : colors.text;
        return (
          <View key={d.day} style={styles.day}>
            <Text style={[type.caption, { color: colors.textSecondary }]}>{weekdayLetter(d.day)}</Text>
            <View
              style={[
                styles.circle,
                { backgroundColor: fill, borderColor: border, opacity: d.isFuture ? 0.5 : 1 },
              ]}>
              <Text style={[styles.number, { color: numberColor }]}>{dayOfMonth(d.day)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm },
  day: { alignItems: 'center', gap: space.xs },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontFamily: fonts.semibold, fontSize: 14, fontVariant: ['tabular-nums'] },
});

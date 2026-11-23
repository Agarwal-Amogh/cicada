import { StyleSheet, Text, View } from 'react-native';

import { formatEntryTime } from '@/domain/dates';
import type { EntryWithTags } from '@/domain/types';
import { radius, space, type, useColors } from '@/theme/tokens';

// A past entry: text only, three lines, the date underneath (Board 1, 1C).
// Tags stay out of sight here (Decision 0007).
export function EntryCard({ entry }: { entry: EntryWithTags }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[type.entrySmall, { color: colors.text }]} numberOfLines={3}>
        {entry.body}
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary }]}>{formatEntryTime(entry.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: space.lg, gap: space.sm },
});

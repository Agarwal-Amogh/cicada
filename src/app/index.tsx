import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData, useEntries } from '@/data/DataProvider';
import { space, type, useColors } from '@/theme/tokens';

// The Journal screen. Ticket 03 fills it: week strip, insight note, entries, +.
export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { error } = useData();
  const entries = useEntries();
  const count = error ? `Couldn't open your journal: ${error}` : entries ? `${entries.length} entries` : 'Opening…';
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + space.xl }]}>
      <Text style={[type.largeTitle, { color: colors.text }]}>Journal</Text>
      <Text style={[type.caption, { color: colors.textSecondary }]}>{count}</Text>
      {entries?.slice(0, 3).map((e) => (
        <Text key={e.id} style={[type.entry, { color: colors.text, marginTop: space.lg }]} numberOfLines={2}>
          {e.body}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.lg },
});

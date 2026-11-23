import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, type, useColors } from '@/theme/tokens';

// The Journal screen. Ticket 03 fills it: week strip, insight note, entries, +.
export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + space.xl }]}>
      <Text style={[type.largeTitle, { color: colors.text }]}>Journal</Text>
      <Text style={[type.entry, { color: colors.textSecondary, marginTop: space.lg }]}>
        Your entries will live here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.lg },
});

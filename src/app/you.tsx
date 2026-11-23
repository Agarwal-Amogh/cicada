import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, type, useColors } from '@/theme/tokens';

// The You screen. Ticket 07 fills it: learning note, mood grid, pattern charts.
export default function YouScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + space.xl }]}>
      <Text style={[type.largeTitle, { color: colors.text }]}>You</Text>
      <View style={[styles.note, { backgroundColor: colors.accentTint }]}>
        <Text style={[type.label, { color: colors.accent }]}>LEARNING</Text>
        <Text style={[type.entry, { color: colors.text }]}>
          {"I'm learning your patterns. I'll tell you when I notice something real."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.lg },
  note: { marginTop: space.lg, padding: space.lg, borderRadius: radius.md, gap: space.xs },
});

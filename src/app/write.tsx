import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { radius, space, type, useColors } from '@/theme/tokens';

// The writing screen. Ticket 04 builds it: title, text, toolbar, mood on save.
export default function WriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + space.md }]}>
      <PressableScale
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={[styles.back, { backgroundColor: colors.elevated }]}>
        <Text style={[type.headline, { color: colors.text }]}>‹</Text>
      </PressableScale>
      <Text style={[type.entry, { color: colors.textSecondary, marginTop: space.xl }]}>Start writing…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.lg },
  back: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});

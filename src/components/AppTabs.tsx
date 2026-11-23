import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { fonts, radius, space, useColors } from '@/theme/tokens';

// The Journal / You tab bar (vault Decision 0008): a floating pill at the
// bottom centre, like Apple's own apps. The + to write sits beside it on the
// Journal screen (ticket 03).
export function AppTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <View
          // TabList's slot only takes a flat style object.
          style={StyleSheet.flatten([styles.bar, { bottom: insets.bottom + space.md, backgroundColor: colors.elevated }])}
          accessibilityRole="tablist">
          <TabTrigger name="index" href="/" asChild>
            <TabButton label="Journal" />
          </TabTrigger>
          <TabTrigger name="you" href="/you" asChild>
            <TabButton label="You" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { label: string };

function TabButton({ label, isFocused, onPress, onLongPress }: TabButtonProps) {
  const colors = useColors();
  return (
    <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}
        style={[styles.tab, isFocused && { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: isFocused ? colors.text : colors.textSecondary }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.pill,
  },
  tab: {
    paddingHorizontal: space.xl,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
  },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
});

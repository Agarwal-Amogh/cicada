import type { Href } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { fonts, radius, space, useColors } from '@/theme/tokens';

// The Journal / You tab bar (vault Decision 0008): a floating pill at the
// bottom centre, like Apple's own apps. The + to write sits beside it on the
// Journal screen.
// Shared with the + button so the two sit on one line.
export const TAB_BAR_HEIGHT = 48;
export const tabBarBottom = (insetBottom: number) => insetBottom + space.md;

// "/" is the Journal tab at runtime; the generated route types leave it out.
export function AppTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <View
          // TabList's slot only takes a flat style object.
          style={StyleSheet.flatten([styles.bar, { bottom: tabBarBottom(insets.bottom), backgroundColor: colors.elevated }])}
          accessibilityRole="tablist">
          <TabTrigger name="index" href={"/" as Href} asChild>
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
    height: TAB_BAR_HEIGHT,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.pill,
  },
  tab: {
    paddingHorizontal: space.xl,
    height: TAB_BAR_HEIGHT - space.xs * 2,
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
});

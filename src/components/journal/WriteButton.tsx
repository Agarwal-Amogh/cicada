import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT, tabBarBottom } from '@/components/AppTabs';
import { PressableScale } from '@/components/PressableScale';
import { fonts, radius, space, useColors } from '@/theme/tokens';

// The + to write, a round accent button on the same line as the tab pill,
// at the right edge (Decision 0009).
export function WriteButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Write an entry"
      style={[
        styles.button,
        { backgroundColor: colors.accent, bottom: tabBarBottom(insets.bottom), right: space.lg + insets.right },
      ]}>
      <Text style={[styles.plus, { color: colors.onAccent }]}>+</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: TAB_BAR_HEIGHT,
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontFamily: fonts.regular, fontSize: 28, lineHeight: 32, marginTop: -2 },
});

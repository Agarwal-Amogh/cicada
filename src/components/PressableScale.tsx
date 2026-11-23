import { type ReactNode, useState } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { motion } from '../theme/tokens';
import { useReduceMotion } from '../theme/useReduceMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type State = { pressed: boolean };

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle> | ((state: State) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: State) => ReactNode);
};

// The one press behaviour for everything tappable: it squishes
// to motion.pressScale on press-in and springs back on release. Press-in waits
// motion.pressDelay, so a finger that starts scrolling never squishes what it
// touched. Still when reduce motion is on.
export function PressableScale({ style, children, onPressIn, onPressOut, ...props }: Props) {
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const [pressed, setPressed] = useState(false);
  // Eases down and back with no bounce, like Apple's buttons.
  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 22, bounciness: 0 }).start();

  return (
    <AnimatedPressable
      unstable_pressDelay={motion.pressDelay}
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        if (!reduceMotion) springTo(motion.pressScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        springTo(1);
        onPressOut?.(event);
      }}
      style={[typeof style === 'function' ? style({ pressed }) : style, { transform: [{ scale }] }]}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </AnimatedPressable>
  );
}

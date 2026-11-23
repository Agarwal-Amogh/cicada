import { useEffect, useState } from 'react';
import { Dimensions, Keyboard } from 'react-native';

// The on-screen keyboard's height while it's up. Edge to edge, Android no
// longer shrinks the window for it, so the card lifts itself. Measured from
// the keyboard's top edge to the bottom of the screen: the reported height
// leaves out the gesture bar on some phones (the Pixel), which left buttons
// half under the keyboard.
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setHeight(Math.max(e.endCoordinates.height, Dimensions.get('screen').height - e.endCoordinates.screenY)),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

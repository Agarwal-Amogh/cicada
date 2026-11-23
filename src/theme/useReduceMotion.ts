import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Whether the phone's reduce-motion setting is on. Animations stop or simplify
// when it is (spec: Motion).
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce, () => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => subscription.remove();
  }, []);
  return reduce;
}

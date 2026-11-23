import { Easing, FadeIn, FadeOut, Keyframe } from 'react-native-reanimated';

// The app's one motion system (vault Decision 0003). The rules for using these, and
// a list of every animation in the app, are in the vault's Architecture/Motion.md.
// Screens take their curves and springs from here, never their own numbers.

// Easing curves for UI motion. Never ease-in on UI: it delays the moment the
// eye is on. The one exception is a fall, which should gather speed.
export const curves = {
  // Entering, exiting, and the default.
  out: Easing.bezier(0.23, 1, 0.32, 1),
  // Moving or morphing on screen.
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  // Something dropping under gravity, like the launch logo's dot.
  fall: Easing.in(Easing.quad),
};

// Springs, as duration and damping ratio. A finger that let go hands its
// velocity to these. Tuned after Apple's own: unhurried, and
// settling without a bounce, except the one landing squish.
export const springs = {
  // Settles with no overshoot: something small moving into place on a tap.
  settle: { duration: 380, dampingRatio: 1 },
  // A sheet rising over the screen, like iOS's: about half a second, no bounce.
  sheetIn: { duration: 520, dampingRatio: 1 },
  // The sheet going away: a little quicker than it came, but never a snap.
  sheetOut: { duration: 420, dampingRatio: 1 },
  // A sheet let go after a drag: it keeps the finger's speed, barely any give.
  release: { duration: 420, dampingRatio: 0.92 },
  // Chrome gliding out of the way and back: unhurried, no overshoot.
  glide: { duration: 520, dampingRatio: 1 },
  // A tab bar shrinking while reading and growing back: slower than any tap
  // feedback, so the size change is felt rather than seen, with no overshoot.
  dockResize: { duration: 700, dampingRatio: 1 },
  // A tab page settling after a sideways swipe: the finger's
  // speed carries on into it, and it comes to rest without a bounce.
  page: { duration: 460, dampingRatio: 1 },
  // A landing squish springing back: a soft give, not a wobble.
  squish: { duration: 480, dampingRatio: 0.7 },
} as const;

// The reduce-motion stand-in for a slide or spring: a short fade, out quicker
// than in. Pass to withTiming.
export const reduceFade = {
  in: { duration: 200, easing: curves.out },
  out: { duration: 160, easing: curves.out },
};

// A pill sliding between two tabs: it moves on screen, so in-out.
export const slide = { duration: 300, easing: curves.inOut };

// Dialogs: the backdrop fades, the card scales up from just
// under full size. Out is quicker than in. Reduce motion skips both.
export const dialogMotion = {
  backdropIn: FadeIn.duration(280),
  backdropOut: FadeOut.duration(220),
  cardIn: new Keyframe({
    0: { opacity: 0, transform: [{ scale: 0.95 }] },
    100: { opacity: 1, transform: [{ scale: 1 }], easing: curves.out },
  }).duration(320),
  cardOut: new Keyframe({
    0: { opacity: 1, transform: [{ scale: 1 }] },
    100: { opacity: 0, transform: [{ scale: 0.97 }], easing: curves.out },
  }).duration(220),
};

// A card rising into place from just below (an insight note, a toast).
export const riseIn = (delay = 0) =>
  new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 24 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: curves.out },
  })
    .duration(420)
    .delay(delay);

// Leaving: about two thirds of the way in, and eased the whole way, so it
// fades rather than vanishes.
export const sinkOut = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: 16 }], easing: curves.inOut },
}).duration(280);

// A step in a multi-step card sliding in: forward from the right, back from the left.
export const stepIn = (direction: 'forward' | 'back') =>
  new Keyframe({
    0: { opacity: 0, transform: [{ translateX: direction === 'forward' ? 24 : -24 }] },
    100: { opacity: 1, transform: [{ translateX: 0 }], easing: curves.out },
  }).duration(320);

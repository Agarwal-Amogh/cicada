# Cicada

A private journal that reads your entries alongside your sleep, steps and screen time, and shows you the patterns behind how you feel. Everything runs on your phone.

Built for wHACKiest 2026, Track 3: Know Thyself.

## How it works
1. You write a normal journal. No chat, no prompts.
2. A small model on the phone tags each entry (mood, emotions, triggers, people).
3. Cicada reads Health Connect (steps, sleep, heart rate where available) and screen time.
4. Plain code finds links between what you wrote and what your body and phone were doing.
5. A weekly letter explains the strongest patterns and suggests one small experiment.

## Run it (Android)
Needs Node 20+, JDK 17 and the Android SDK. Expo Go can't run it; it's a development build.

```
npm install
npx expo run:android
npm start
```

Checks: `npm run typecheck`, `npm run lint`.

## Stack
Expo + React Native + TypeScript, Expo Router, Reanimated. More in the project notes.

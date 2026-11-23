import { addDays, startOfDay } from '@/domain/dates';
import type { DayKey, DaySignals, Entry, Tags } from '@/domain/types';

import type { SignalSource } from '../store';
import { plan } from './plan';

export type SeedMonth = {
  entries: { entry: Entry; tags: Tags }[];
  days: DaySignals[];
};

// A small seeded random generator, so the same day always gives the same month.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand: () => number, lo: number, hi: number) => lo + (hi - lo) * rand();
const MIN = 60_000;

/**
 * The sample month, ending on `today`. Pure: no clock, no storage.
 * Its last day is `today`, which has signals so far but no entry.
 */
export function buildSeedMonth(today: DayKey): SeedMonth {
  const rand = mulberry32(20261123);
  const first = addDays(today, -(plan.length - 1));
  const entries: SeedMonth['entries'] = [];
  const days: DaySignals[] = [];

  plan.forEach((planned, i) => {
    const day = addDays(first, i);
    const midnight = startOfDay(day).getTime();
    const short = planned.flags.includes('S');
    const run = planned.flags.includes('R');
    const meera = planned.flags.includes('M');
    const deadline = planned.flags.includes('D');

    // Sleep that ended this morning. Late scrolling pushes bedtime past 1:30.
    const lateScreen = short ? Math.round(between(rand, 70, 115)) : Math.round(between(rand, 0, 20));
    const bedAt = short
      ? midnight + Math.round(between(rand, 95, 130)) * MIN
      : midnight - Math.round(between(rand, 10, 60)) * MIN;
    const sleepMinutes = short
      ? Math.round(between(rand, 265, 340))
      : deadline
        ? Math.round(between(rand, 365, 400))
        : Math.round(between(rand, 420, 475));
    const wakeAt = bedAt + sleepMinutes * MIN;

    const steps = run
      ? Math.round(between(rand, 9500, 12500))
      : meera
        ? Math.round(between(rand, 7000, 8500))
        : Math.round(between(rand, 4200, 7000));
    const screen = short ? Math.round(between(rand, 380, 460)) : Math.round(between(rand, 250, 340));
    const social = Math.round(screen * (short ? between(rand, 0.45, 0.55) : between(rand, 0.25, 0.35)));
    const unlocks = Math.round(between(rand, 70, 110) + (short ? 40 : 0));

    days.push({
      day,
      sleepMinutes,
      sleepSource: 'phone-estimate',
      bedAt,
      wakeAt,
      steps,
      restingHeartRate: null,
      hrv: null,
      screenMinutes: screen,
      lateScreenMinutes: lateScreen,
      socialMinutes: social,
      unlocks,
      source: 'seed',
    });

    const e = planned.entry;
    if (!e) return;
    const createdAt = midnight + Math.round(between(rand, 21 * 60, 23 * 60 + 40)) * MIN;
    entries.push({
      entry: {
        id: `seed-${day}`,
        createdAt,
        day,
        title: e.title,
        body: e.body,
        mood: e.tappedMood ? e.mood + 3 : null,
        source: 'seed',
      },
      tags: {
        mood: e.mood,
        energy: e.energy,
        emotions: e.emotions,
        triggers: e.triggers,
        people: e.people,
        tagger: 'seed',
      },
    });
  });

  return { entries, days };
}

/** The sample month as a signal source, the same shape real sources will have. */
export function seedSignalSource(today: DayKey): SignalSource {
  const { days } = buildSeedMonth(today);
  return {
    async readDays(from, to) {
      return days.filter((d) => d.day >= from && d.day <= to);
    },
  };
}

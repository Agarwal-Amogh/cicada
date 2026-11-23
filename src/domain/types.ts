// Cicada's core records. Names follow the vault glossary (Domain/Glossary.md):
// an Entry is what the user writes, Tags are what the on-device model pulls
// from it, and a day's Signals are what the body and phone did.

/** A local calendar day, `YYYY-MM-DD`. */
export type DayKey = string;

export type Entry = {
  id: string;
  /** When it was written, ms since epoch. */
  createdAt: number;
  /** The local day it belongs to. */
  day: DayKey;
  title: string | null;
  body: string;
  /** The optional one-tap mood on save, 1 (rough) to 5 (great). */
  mood: number | null;
  /** `seed` marks the sample month; `user` is real writing. */
  source: 'user' | 'seed';
};

export type Tags = {
  /** How the entry feels, -2 (very negative) to 2 (very positive). */
  mood: number;
  /** How much energy it carries, -2 (drained) to 2 (wired). */
  energy: number;
  emotions: string[];
  triggers: string[];
  people: string[];
  /** Which tagger produced these (`seed`, `rules`, or a model name). */
  tagger: string;
};

export type EntryWithTags = Entry & { tags: Tags | null };

/**
 * One day's body and phone data. Sleep belongs to the day you woke up.
 * Any field can be missing: no watch means no heart rate.
 */
export type DaySignals = {
  day: DayKey;
  sleepMinutes: number | null;
  /** Where sleep came from: a watch, or estimated from phone use. */
  sleepSource: 'watch' | 'phone-estimate' | null;
  /** Went to bed, ms since epoch. */
  bedAt: number | null;
  /** Woke up, ms since epoch. */
  wakeAt: number | null;
  steps: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  screenMinutes: number | null;
  /** Phone use between midnight and falling asleep. */
  lateScreenMinutes: number | null;
  socialMinutes: number | null;
  unlocks: number | null;
  source: 'seed' | 'device';
};

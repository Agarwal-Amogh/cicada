import type { DayKey, DaySignals, Entry, EntryWithTags, Tags } from '@/domain/types';

/**
 * Everything Cicada keeps, behind one interface. The app uses the SQLite
 * version (sqliteStore.ts); tests can use a fake.
 */
export interface JournalStore {
  /** Newest first, each with its tags if tagged. */
  listEntries(): Promise<EntryWithTags[]>;
  addEntry(entry: Entry): Promise<void>;
  saveTags(entryId: string, tags: Tags): Promise<void>;
  upsertDays(days: DaySignals[]): Promise<void>;
  /** Days from `from` to `to`, both included, oldest first. */
  listDays(from: DayKey, to: DayKey): Promise<DaySignals[]>;
  getMeta(key: string): Promise<string | null>;
  setMeta(key: string, value: string): Promise<void>;
  /** Several writes that land together or not at all. */
  transaction(work: () => Promise<void>): Promise<void>;
}

/**
 * Where a day's body and phone data comes from. The demo month is one source;
 * Health Connect plus screen time (ticket 09) will be another.
 */
export interface SignalSource {
  readDays(from: DayKey, to: DayKey): Promise<DaySignals[]>;
}

/** Copies a source's days into the store. */
export async function syncSignals(source: SignalSource, store: JournalStore, from: DayKey, to: DayKey) {
  const days = await source.readDays(from, to);
  if (days.length) await store.upsertDays(days);
  return days.length;
}

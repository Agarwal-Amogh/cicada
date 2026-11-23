import type { DayKey } from '@/domain/types';

import type { JournalStore } from '../store';
import { buildSeedMonth } from './seedMonth';

const SEEDED = 'seeded';

/** Fills an empty store with the sample month, once. Returns whether it seeded. */
export async function seedIfEmpty(store: JournalStore, today: DayKey): Promise<boolean> {
  if (await store.getMeta(SEEDED)) return false;
  const month = buildSeedMonth(today);
  await store.transaction(async () => {
    await store.upsertDays(month.days);
    for (const { entry, tags } of month.entries) {
      await store.addEntry(entry);
      await store.saveTags(entry.id, tags);
    }
    await store.setMeta(SEEDED, today);
  });
  return true;
}

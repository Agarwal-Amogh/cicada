import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { dayKey } from '@/domain/dates';
import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

import { seedIfEmpty } from './seed/seedStore';
import { openSqliteStore } from './sqliteStore';
import type { JournalStore } from './store';

type Data = {
  store: JournalStore | null;
  error: string | null;
  /** Bumps after any write, so screens reload what they show. */
  version: number;
  changed: () => void;
};

const DataContext = createContext<Data>({ store: null, error: null, version: 0, changed: () => {} });

/** Opens the encrypted store once and fills it with the sample month on first run. */
export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<JournalStore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const changed = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await openSqliteStore();
        await seedIfEmpty(s, dayKey(new Date()));
        if (live) setStore(s);
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return <DataContext.Provider value={{ store, error, version, changed }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}

/** All entries, newest first. Null until the store is open. */
export function useEntries(): EntryWithTags[] | null {
  const { store, version } = useData();
  const [entries, setEntries] = useState<EntryWithTags[] | null>(null);
  useEffect(() => {
    if (!store) return;
    let live = true;
    store.listEntries().then((e) => live && setEntries(e));
    return () => {
      live = false;
    };
  }, [store, version]);
  return entries;
}

/** Body and phone data for a range of days, oldest first. Null until loaded. */
export function useDays(from: DayKey, to: DayKey): DaySignals[] | null {
  const { store, version } = useData();
  const [days, setDays] = useState<DaySignals[] | null>(null);
  useEffect(() => {
    if (!store) return;
    let live = true;
    store.listDays(from, to).then((d) => live && setDays(d));
    return () => {
      live = false;
    };
  }, [store, version, from, to]);
  return days;
}

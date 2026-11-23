import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import type { DayKey, DaySignals, Entry, EntryWithTags, Tags } from '@/domain/types';

import type { JournalStore } from './store';

const DB_NAME = 'cicada.db';
const KEY_NAME = 'cicada.db.key';

// Each step moves the schema up one version. Never edit a shipped step; add one.
const MIGRATIONS = [
  `
  CREATE TABLE entries (
    id TEXT PRIMARY KEY NOT NULL,
    created_at INTEGER NOT NULL,
    day TEXT NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    mood INTEGER,
    source TEXT NOT NULL
  );
  CREATE INDEX entries_day ON entries(day);
  CREATE TABLE tags (
    entry_id TEXT PRIMARY KEY NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    mood REAL NOT NULL,
    energy REAL NOT NULL,
    emotions TEXT NOT NULL,
    triggers TEXT NOT NULL,
    people TEXT NOT NULL,
    tagger TEXT NOT NULL
  );
  CREATE TABLE days (
    day TEXT PRIMARY KEY NOT NULL,
    sleep_minutes INTEGER,
    sleep_source TEXT,
    bed_at INTEGER,
    wake_at INTEGER,
    steps INTEGER,
    resting_hr INTEGER,
    hrv REAL,
    screen_minutes INTEGER,
    late_screen_minutes INTEGER,
    social_minutes INTEGER,
    unlocks INTEGER,
    source TEXT NOT NULL
  );
  CREATE TABLE patterns (
    id TEXT PRIMARY KEY NOT NULL,
    week TEXT NOT NULL,
    kind TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  `,
];

/** The database key lives in the phone's secure storage, made once. */
async function databaseKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return existing;
  const bytes = Crypto.getRandomBytes(32);
  const key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(KEY_NAME, key);
  return key;
}

let opening: Promise<JournalStore> | null = null;

/**
 * Opens the encrypted database (SQLCipher) and brings its schema up to date.
 * Opens once per app run: two racing opens would each make a key, and the
 * database would end up locked with the one that got overwritten.
 */
export function openSqliteStore(): Promise<JournalStore> {
  opening ??= open().catch((e) => {
    opening = null;
    throw e;
  });
  return opening;
}

async function open(): Promise<JournalStore> {
  const key = await databaseKey();
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  // Must be the first statement on the connection, on its own. The key is hex we made.
  await db.execAsync(`PRAGMA key = '${key}'`);
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  for (let v = version; v < MIGRATIONS.length; v++) {
    // Not withExclusiveTransactionAsync: that opens a second connection,
    // which has no key and sees the encrypted file as "not a database".
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[v]);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return new SqliteStore(db);
}

type EntryRow = {
  id: string;
  created_at: number;
  day: string;
  title: string | null;
  body: string;
  mood: number | null;
  source: Entry['source'];
  t_mood: number | null;
  t_energy: number | null;
  t_emotions: string | null;
  t_triggers: string | null;
  t_people: string | null;
  t_tagger: string | null;
};

type DayRow = {
  day: string;
  sleep_minutes: number | null;
  sleep_source: DaySignals['sleepSource'];
  bed_at: number | null;
  wake_at: number | null;
  steps: number | null;
  resting_hr: number | null;
  hrv: number | null;
  screen_minutes: number | null;
  late_screen_minutes: number | null;
  social_minutes: number | null;
  unlocks: number | null;
  source: DaySignals['source'];
};

class SqliteStore implements JournalStore {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async listEntries(): Promise<EntryWithTags[]> {
    const rows = await this.db.getAllAsync<EntryRow>(
      `SELECT e.*, t.mood AS t_mood, t.energy AS t_energy, t.emotions AS t_emotions,
              t.triggers AS t_triggers, t.people AS t_people, t.tagger AS t_tagger
       FROM entries e LEFT JOIN tags t ON t.entry_id = e.id
       ORDER BY e.created_at DESC`,
    );
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      day: r.day,
      title: r.title,
      body: r.body,
      mood: r.mood,
      source: r.source,
      tags:
        r.t_tagger === null
          ? null
          : {
              mood: r.t_mood ?? 0,
              energy: r.t_energy ?? 0,
              emotions: JSON.parse(r.t_emotions ?? '[]'),
              triggers: JSON.parse(r.t_triggers ?? '[]'),
              people: JSON.parse(r.t_people ?? '[]'),
              tagger: r.t_tagger,
            },
    }));
  }

  async addEntry(e: Entry) {
    await this.db.runAsync(
      'INSERT INTO entries (id, created_at, day, title, body, mood, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      e.id, e.createdAt, e.day, e.title, e.body, e.mood, e.source,
    );
  }

  async saveTags(entryId: string, t: Tags) {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO tags (entry_id, mood, energy, emotions, triggers, people, tagger)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      entryId, t.mood, t.energy, JSON.stringify(t.emotions), JSON.stringify(t.triggers),
      JSON.stringify(t.people), t.tagger,
    );
  }

  async upsertDays(days: DaySignals[]) {
    for (const d of days) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO days (day, sleep_minutes, sleep_source, bed_at, wake_at, steps,
           resting_hr, hrv, screen_minutes, late_screen_minutes, social_minutes, unlocks, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        d.day, d.sleepMinutes, d.sleepSource, d.bedAt, d.wakeAt, d.steps, d.restingHeartRate,
        d.hrv, d.screenMinutes, d.lateScreenMinutes, d.socialMinutes, d.unlocks, d.source,
      );
    }
  }

  async listDays(from: DayKey, to: DayKey): Promise<DaySignals[]> {
    const rows = await this.db.getAllAsync<DayRow>(
      'SELECT * FROM days WHERE day >= ? AND day <= ? ORDER BY day',
      from, to,
    );
    return rows.map((r) => ({
      day: r.day,
      sleepMinutes: r.sleep_minutes,
      sleepSource: r.sleep_source,
      bedAt: r.bed_at,
      wakeAt: r.wake_at,
      steps: r.steps,
      restingHeartRate: r.resting_hr,
      hrv: r.hrv,
      screenMinutes: r.screen_minutes,
      lateScreenMinutes: r.late_screen_minutes,
      socialMinutes: r.social_minutes,
      unlocks: r.unlocks,
      source: r.source,
    }));
  }

  async getMeta(key: string) {
    const row = await this.db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
    return row?.value ?? null;
  }

  async setMeta(key: string, value: string) {
    await this.db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, value);
  }

  async transaction(work: () => Promise<void>) {
    await this.db.withTransactionAsync(work);
  }
}

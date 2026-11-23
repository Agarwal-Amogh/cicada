import { describe, expect, it } from '@jest/globals';

import { buildSeedMonth } from '@/data/seed/seedMonth';
import { addDays } from '@/domain/dates';
import type { DaySignals, EntryWithTags } from '@/domain/types';

import { dailyRows } from './dailyRows';
import { findPatterns } from './patterns';

const TODAY = '2026-11-23';
const FROM = addDays(TODAY, -34);
const month = buildSeedMonth(TODAY);
const entries: EntryWithTags[] = month.entries.map(({ entry, tags }) => ({ ...entry, tags }));
const patterns = findPatterns(entries, month.days, FROM, TODAY);
const byId = new Map(patterns.map((p) => [p.id, p]));

describe('daily rows', () => {
  it('puts each day once, with mood averaged from its tagged entries', () => {
    const rows = dailyRows(entries, month.days);
    expect(rows).toHaveLength(35);
    const twice = dailyRows(
      [...entries, { ...entries[0], id: 'extra', tags: { ...entries[0].tags!, mood: 0 } }],
      month.days,
    );
    const row = twice.find((r) => r.day === entries[0].day)!;
    expect(row.mood).toBe((entries[0].tags!.mood + 0) / 2);
    expect(row.entries).toHaveLength(2);
  });
});

describe('the pattern finder on the sample month', () => {
  it('finds the four built-in patterns and nothing thin', () => {
    expect([...byId.keys()].sort()).toEqual(
      ['active-days', 'late-screen-sleep', 'person-meera', 'short-sleep', 'trigger-deadline'].sort(),
    );
  });

  it('ranks strongest first', () => {
    const strengths = patterns.map((p) => p.strength);
    expect(strengths).toEqual([...strengths].sort((a, b) => b - a));
  });

  it('ties short sleep to rough entries, with the one exception showing', () => {
    const p = byId.get('short-sleep')!;
    expect(p.direction).toBe('hard');
    expect(p.of).toBe(10);
    expect(p.held).toBe(9);
    expect(p.sentence).toBe('After nights under six hours, your entries were rougher 9 of 10 times.');
    expect(p.receipts).toHaveLength(10);
    expect(p.receipts.every((r) => r.value! < 360 && r.excerpt)).toBe(true);
  });

  it('ties late scrolling to short sleep', () => {
    const p = byId.get('late-screen-sleep')!;
    expect(p.held).toBe(p.of);
    expect(p.effect).toBeGreaterThan(120);
    expect(p.chart).toBe('lateScreenMinutes');
  });

  it('sees active days and Meera as good, deadlines as hard', () => {
    expect(byId.get('active-days')!.direction).toBe('good');
    expect(byId.get('person-meera')!.direction).toBe('good');
    expect(byId.get('trigger-deadline')).toMatchObject({ direction: 'hard', title: 'Deadlines weigh on you' });
  });

  it('gives every pattern an experiment and receipts', () => {
    for (const p of patterns) {
      expect(p.experiment.length).toBeGreaterThan(10);
      expect(p.receipts.length).toBe(p.of);
    }
  });
});

describe('the pattern finder stays quiet when it should', () => {
  it('finds nothing with no data', () => {
    expect(findPatterns([], [], FROM, TODAY)).toEqual([]);
  });

  it('finds nothing in the first few days (the learning period)', () => {
    expect(findPatterns(entries, month.days, addDays(TODAY, -4), TODAY)).toEqual([]);
  });

  it('finds no sleep pattern when mood does not follow sleep', () => {
    const flat = entries.map((e) => ({ ...e, tags: { ...e.tags!, mood: 0 } }));
    expect(findPatterns(flat, month.days, FROM, TODAY).filter((p) => p.kind !== 'late-screen-sleep')).toEqual([]);
  });

  it('never blames a person', () => {
    const rough = entries.map((e) =>
      e.tags!.people.includes('Meera') ? { ...e, tags: { ...e.tags!, mood: -2 } } : e,
    );
    expect(findPatterns(rough, month.days, FROM, TODAY).some((p) => p.kind === 'person')).toBe(false);
  });

  it('skips days with missing signals instead of guessing', () => {
    const noSleep: DaySignals[] = month.days.map((d) => ({ ...d, sleepMinutes: null }));
    const found = findPatterns(entries, noSleep, FROM, TODAY).map((p) => p.id);
    expect(found).not.toContain('short-sleep');
    expect(found).not.toContain('late-screen-sleep');
  });
});

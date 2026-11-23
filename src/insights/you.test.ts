import { describe, expect, it } from '@jest/globals';

import { buildSeedMonth } from '@/data/seed/seedMonth';
import { addDays } from '@/domain/dates';
import type { EntryWithTags } from '@/domain/types';

import { chartSpec } from './chartData';
import { dailyRows } from './dailyRows';
import { moodGrid, shiftMonth } from './moodGrid';
import { findPatterns } from './patterns';

const TODAY = '2026-11-23';
const month = buildSeedMonth(TODAY);
const entries: EntryWithTags[] = month.entries.map(({ entry, tags }) => ({ ...entry, tags }));

describe('mood grid', () => {
  it('lays November 2026 out in Monday-first weeks', () => {
    const weeks = moodGrid('2026-11-01', entries, TODAY);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0].day).toBe('2026-10-26');
    expect(weeks[0].find((c) => c.day === '2026-11-01')!.inMonth).toBe(true);
    // 30 Nov 2026 is a Monday, so the last row runs into December.
    expect(weeks.at(-1)![0]).toMatchObject({ day: '2026-11-30', inMonth: true });
    expect(weeks.at(-1)!.at(-1)).toMatchObject({ day: '2026-12-06', inMonth: false });
  });

  it('colours written days by mood and leaves gaps empty', () => {
    const cells = moodGrid('2026-11-01', entries, TODAY).flat();
    const sat = cells.find((c) => c.day === '2026-11-22')!;
    expect(sat.mood).toBe(-2);
    expect(cells.find((c) => c.day === TODAY)).toMatchObject({ mood: null, isToday: true });
    expect(cells.find((c) => c.day === '2026-11-30')!.isFuture).toBe(true);
  });

  it('uses the one-tap mood when an entry has no tags yet', () => {
    const untagged = { ...entries[0], id: 'x', day: TODAY, mood: 5, tags: null };
    const cell = moodGrid('2026-11-01', [untagged], TODAY).flat().find((c) => c.day === TODAY)!;
    expect(cell.mood).toBe(2);
  });

  it('moves between months', () => {
    expect(shiftMonth('2026-11-01', -1)).toBe('2026-10-01');
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
  });
});

describe('pattern charts', () => {
  const from = addDays(TODAY, -27);
  const rows = dailyRows(entries, month.days);
  const patterns = findPatterns(entries, month.days, from, TODAY);

  it('draws the sleep chart in hours with short nights and rough entries marked', () => {
    const spec = chartSpec(patterns.find((p) => p.id === 'short-sleep')!, rows, from, TODAY)!;
    expect(spec.points).toHaveLength(28);
    expect(spec.threshold).toBe(6);
    expect(spec.points.filter((p) => p.highlight).every((p) => p.value! < 6)).toBe(true);
    const roughOnShort = spec.points.filter((p) => p.highlight && p.marker).length;
    expect(roughOnShort).toBeGreaterThan(spec.points.filter((p) => p.highlight).length / 2);
    expect(spec.max).toBeGreaterThanOrEqual(Math.max(...spec.points.map((p) => p.value ?? 0)));
  });

  it('draws steps against good days', () => {
    const spec = chartSpec(patterns.find((p) => p.id === 'active-days')!, rows, from, TODAY)!;
    expect(spec.barLabel).toBe('steps');
    expect(spec.points.filter((p) => p.highlight).every((p) => p.value! >= 9000)).toBe(true);
  });

  it('has no chart for people and triggers', () => {
    expect(chartSpec(patterns.find((p) => p.kind === 'person')!, rows, from, TODAY)).toBeNull();
  });
});

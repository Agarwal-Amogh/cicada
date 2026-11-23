import { describe, expect, it } from '@jest/globals';

import { buildSeedMonth } from '@/data/seed/seedMonth';
import { weekNote } from '@/insights/weekNote';

import { formatEntryTime, weekStart } from './dates';
import { journalSections, weekStrip } from './journalSections';
import type { EntryWithTags } from './types';

// 23 Nov 2026 is a Monday.
const TODAY = '2026-11-23';
const month = buildSeedMonth(TODAY);
const entries: EntryWithTags[] = month.entries
  .map(({ entry, tags }) => ({ ...entry, tags }))
  .sort((a, b) => b.createdAt - a.createdAt);

describe('dates', () => {
  it('starts weeks on Monday', () => {
    expect(weekStart('2026-11-23')).toBe('2026-11-23');
    expect(weekStart('2026-11-29')).toBe('2026-11-23');
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });

  it('formats an entry time', () => {
    expect(formatEntryTime(new Date(2026, 10, 22, 23, 40).getTime())).toBe('Sun 22 Nov · 11:40 PM');
    expect(formatEntryTime(new Date(2026, 10, 22, 0, 5).getTime())).toBe('Sun 22 Nov · 12:05 AM');
  });
});

describe('journal sections', () => {
  it('groups newest first into last week, then months, keeping every entry', () => {
    const sections = journalSections(entries, TODAY);
    expect(sections.map((s) => s.title)).toEqual(['Last week', 'November 2026', 'October 2026']);
    expect(sections.flatMap((s) => s.data)).toHaveLength(entries.length);
  });

  it('puts today under This week', () => {
    const today = { ...entries[0], id: 'new', day: TODAY, createdAt: Date.now() };
    expect(journalSections([today, ...entries], TODAY)[0]).toMatchObject({ title: 'This week', data: [today] });
  });
});

describe('week strip', () => {
  it('shows Monday to Sunday with written days', () => {
    const strip = weekStrip(entries, '2026-11-26');
    expect(strip).toHaveLength(7);
    expect(strip[0].day).toBe('2026-11-23');
    expect(strip[3]).toMatchObject({ day: '2026-11-26', isToday: true, isFuture: false });
    expect(strip[6].isFuture).toBe(true);
    expect(strip.filter((d) => d.written).map((d) => d.day)).toEqual(
      entries.filter((e) => e.day >= '2026-11-23' && e.day <= '2026-11-29').map((e) => e.day).sort(),
    );
  });
});

describe('week note', () => {
  it('speaks up about short nights in the sample month', () => {
    const note = weekNote(entries, month.days, TODAY);
    expect(note).not.toBeNull();
    expect(note!.sentence).toMatch(/after sleeping under six hours/);
    expect(note!.days.length).toBeGreaterThanOrEqual(2);
  });

  it('stays quiet without enough short nights', () => {
    const rested = month.days.map((d) => ({ ...d, sleepMinutes: 450 }));
    expect(weekNote(entries, rested, TODAY)).toBeNull();
  });
});

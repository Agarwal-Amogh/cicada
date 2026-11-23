import { describe, expect, it } from '@jest/globals';

import { buildSeedMonth } from '@/data/seed/seedMonth';
import type { EntryWithTags } from '@/domain/types';

import { lastFullWeek, weeklyLetter } from './weeklyLetter';

const TODAY = '2026-11-23'; // a Monday
const month = buildSeedMonth(TODAY);
const entries: EntryWithTags[] = month.entries.map(({ entry, tags }) => ({ ...entry, tags }));

describe('the weekly letter', () => {
  it('covers last week, Monday to Sunday', () => {
    expect(lastFullWeek(TODAY)).toEqual({ from: '2026-11-16', to: '2026-11-22' });
    expect(lastFullWeek('2026-11-29')).toEqual({ from: '2026-11-16', to: '2026-11-22' });
  });

  it('stays short: a hard pattern, a good one, and a pointer to the rest', () => {
    const letter = weeklyLetter(entries, month.days, TODAY);
    expect(letter.paragraphs).toHaveLength(3);
    expect(letter.paragraphs[0]).toMatch(/^You slept under six hours three times this week, and the day after each/);
    expect(letter.paragraphs[0]).toMatch(/phone past midnight/);
    expect(letter.paragraphs[1]).toMatch(/went the other way|best moments/);
    expect(letter.paragraphs.join(' ').split(/\s+/).length).toBeLessThan(90);
  });

  it('offers one experiment about the cause, not the symptom', () => {
    expect(weeklyLetter(entries, month.days, TODAY).experiment).toMatch(/Phone down by 12:30/);
  });

  it('hands every pattern to the flashcards, strongest first', () => {
    const { patterns } = weeklyLetter(entries, month.days, TODAY);
    expect(patterns.length).toBeGreaterThanOrEqual(4);
    expect(patterns.map((p) => p.strength)).toEqual([...patterns.map((p) => p.strength)].sort((a, b) => b - a));
  });

  it('says nothing while Cicada is still learning', () => {
    const letter = weeklyLetter([], [], TODAY);
    expect(letter).toMatchObject({ paragraphs: [], experiment: null, patterns: [] });
  });
});

import { describe, expect, it } from '@jest/globals';

import { buildSeedMonth } from '@/data/seed/seedMonth';
import type { EntryWithTags } from '@/domain/types';

import { writingIdeas } from './writingIdeas';

const TODAY = '2026-11-23';
const month = buildSeedMonth(TODAY);
const entries: EntryWithTags[] = month.entries
  .map(({ entry, tags }) => ({ ...entry, tags }))
  .sort((a, b) => b.createdAt - a.createdAt);

describe('writing ideas', () => {
  it('gives three ideas drawn from the sample month', () => {
    const ideas = writingIdeas(entries, month.days, TODAY);
    expect(ideas).toHaveLength(3);
    expect(ideas.some((i) => /calmest days/.test(i))).toBe(true);
    expect(new Set(ideas).size).toBe(3);
  });

  it('mentions a short night last night', () => {
    const days = month.days.map((d) => (d.day === TODAY ? { ...d, sleepMinutes: 290 } : d));
    expect(writingIdeas(entries, days, TODAY)[0]).toBe('You slept 4 h 50 m last night. How is today going so far?');
  });

  it('notices someone who has faded from the journal', () => {
    const later = '2026-11-27';
    expect(writingIdeas(entries, month.days, later).some((i) => /written about Meera since/.test(i))).toBe(true);
  });

  it('falls back to general ideas with nothing learned', () => {
    const ideas = writingIdeas([], [], TODAY);
    expect(ideas).toHaveLength(3);
    expect(ideas[0]).toBe('What took most of your energy today?');
  });
});

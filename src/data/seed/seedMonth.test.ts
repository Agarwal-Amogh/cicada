import { describe, expect, it } from '@jest/globals';

import { addDays } from '@/domain/dates';

import { buildSeedMonth, seedSignalSource } from './seedMonth';

const TODAY = '2026-11-23';
const month = buildSeedMonth(TODAY);
const byDay = new Map(month.days.map((d) => [d.day, d]));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe('the sample month', () => {
  it('covers 35 days ending today, one row per day', () => {
    expect(month.days).toHaveLength(35);
    expect(month.days[0].day).toBe(addDays(TODAY, -34));
    expect(month.days.at(-1)?.day).toBe(TODAY);
    expect(new Set(month.days.map((d) => d.day)).size).toBe(35);
  });

  it('has most days written, nothing yet today, and tags on every entry', () => {
    expect(month.entries.length).toBeGreaterThanOrEqual(26);
    expect(month.entries.some((e) => e.entry.day === TODAY)).toBe(false);
    for (const { entry, tags } of month.entries) {
      expect(entry.body.length).toBeGreaterThan(20);
      expect(tags.mood).toBeGreaterThanOrEqual(-2);
      expect(tags.mood).toBeLessThanOrEqual(2);
      if (entry.mood !== null) expect(entry.mood).toBe(tags.mood + 3);
    }
  });

  it('is the same every time for the same day', () => {
    expect(buildSeedMonth(TODAY)).toEqual(month);
  });

  it('ties late scrolling to short sleep', () => {
    for (const d of month.days) {
      if ((d.lateScreenMinutes ?? 0) > 60) expect(d.sleepMinutes!).toBeLessThan(6 * 60);
      else expect(d.sleepMinutes!).toBeGreaterThanOrEqual(6 * 60);
    }
  });

  it('makes days after short sleep clearly worse, with one exception', () => {
    const shortDays = month.entries.filter(({ entry }) => byDay.get(entry.day)!.sleepMinutes! < 6 * 60);
    const restDays = month.entries.filter(({ entry }) => byDay.get(entry.day)!.sleepMinutes! >= 6 * 60);
    expect(shortDays.length).toBeGreaterThanOrEqual(8);
    expect(mean(shortDays.map((e) => e.tags.mood))).toBeLessThan(-1.2);
    expect(mean(restDays.map((e) => e.tags.mood))).toBeGreaterThan(0.3);
    expect(shortDays.filter((e) => e.tags.mood >= 0)).toHaveLength(1);
  });

  it('makes run days calm and good', () => {
    const runDays = month.entries.filter(({ entry }) => byDay.get(entry.day)!.steps! > 9000);
    expect(runDays.length).toBeGreaterThanOrEqual(6);
    expect(runDays.every((e) => e.tags.mood >= 1)).toBe(true);
  });

  it('makes days with Meera good', () => {
    const meera = month.entries.filter((e) => e.tags.people.includes('Meera'));
    expect(meera.length).toBeGreaterThanOrEqual(5);
    expect(meera.every((e) => e.tags.mood === 2)).toBe(true);
  });

  it('marks deadline entries as anxious or stressed', () => {
    const deadline = month.entries.filter((e) => e.tags.triggers.some((t) => t === 'deadline' || t === 'exam'));
    expect(deadline.length).toBeGreaterThanOrEqual(5);
    expect(mean(deadline.map((e) => e.tags.mood))).toBeLessThan(0);
  });

  it('works as a signal source over any range', async () => {
    const source = seedSignalSource(TODAY);
    const week = await source.readDays(addDays(TODAY, -6), TODAY);
    expect(week).toHaveLength(7);
    expect(await source.readDays('2020-01-01', '2020-01-31')).toEqual([]);
  });
});

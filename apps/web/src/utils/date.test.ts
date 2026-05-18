import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, relativeDate } from './date';

const FIXED_TODAY = '2025-08-10';

function freezeDate(dateStr: string) {
  const ms = new Date(`${dateStr}T12:00:00`).getTime();
  vi.useFakeTimers();
  vi.setSystemTime(ms);
}

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2025-08-01');
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/sierpn/i); // Polish month name fragment
  });
});

describe('relativeDate', () => {
  it('returns "Today" for the current date', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate(FIXED_TODAY)).toBe('Today');
  });

  it('returns "Tomorrow" for the next day', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate('2025-08-11')).toBe('Tomorrow');
  });

  it('returns "Yesterday" for the previous day', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate('2025-08-09')).toBe('Yesterday');
  });

  it('returns "in N days" for dates up to 14 days ahead', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate('2025-08-17')).toBe('in 7 days');
    expect(relativeDate('2025-08-24')).toBe('in 14 days');
  });

  it('returns "N days ago" for dates up to 14 days past', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate('2025-08-03')).toBe('7 days ago');
    expect(relativeDate('2025-07-27')).toBe('14 days ago');
  });

  it('returns null for dates more than 14 days away', () => {
    freezeDate(FIXED_TODAY);
    expect(relativeDate('2025-09-01')).toBeNull();
    expect(relativeDate('2025-07-01')).toBeNull();
  });
});

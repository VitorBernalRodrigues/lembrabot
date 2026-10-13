import { describe, expect, it } from 'vitest';
import { formatDuration, parseDuration } from '../src/utils/duration.js';

describe('parseDuration', () => {
  it.each([
    ['10s', 10_000],
    ['10m', 600_000],
    ['2h', 7_200_000],
    ['1d', 86_400_000],
    ['1w', 604_800_000],
    ['1h30m', 5_400_000],
    ['1d 12h', 129_600_000],
    ['  2H  ', 7_200_000],
  ])('parses "%s" as %i ms', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each(['', 'amanhã', '10', 'm10', '10x', '1h banana', '-5m'])('rejects invalid input "%s"', (input) => {
    expect(parseDuration(input)).toBeNull();
  });

  it('rejects durations out of bounds', () => {
    expect(parseDuration('5s')).toBeNull();
    expect(parseDuration('400d')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('omits zero parts', () => {
    expect(formatDuration(5_400_000)).toBe('1h 30m');
    expect(formatDuration(90_061_000)).toBe('1d 1h 1m 1s');
    expect(formatDuration(0)).toBe('0s');
  });
});

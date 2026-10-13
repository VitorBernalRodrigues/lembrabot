const UNIT_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
} as const;

type Unit = keyof typeof UNIT_MS;

export const MIN_DURATION_MS = 10_000;
export const MAX_DURATION_MS = 365 * UNIT_MS.d;

const TOKEN = /(\d+)\s*([smhdw])/g;
const FULL = /^(\s*\d+\s*[smhdw]\s*)+$/;

/**
 * Parses durations such as "10m", "1h30m" or "2d 4h" into milliseconds.
 * Returns null when the input is not a valid duration or is out of bounds.
 */
export function parseDuration(input: string): number | null {
  const text = input.trim().toLowerCase();
  if (!FULL.test(text)) return null;

  let total = 0;
  for (const [, amount, unit] of text.matchAll(TOKEN)) {
    total += Number(amount) * UNIT_MS[unit as Unit];
  }

  if (total < MIN_DURATION_MS || total > MAX_DURATION_MS) return null;
  return total;
}

/** Formats milliseconds as "1d 2h 5m", omitting zero parts. */
export function formatDuration(ms: number): string {
  const parts: string[] = [];
  let rest = Math.max(0, Math.round(ms / 1000)) * 1000;

  for (const unit of ['d', 'h', 'm', 's'] as const) {
    const amount = Math.floor(rest / UNIT_MS[unit]);
    if (amount > 0) {
      parts.push(`${amount}${unit}`);
      rest -= amount * UNIT_MS[unit];
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0s';
}

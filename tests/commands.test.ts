import { describe, expect, it } from 'vitest';
import { commands } from '../src/commands/index.js';

describe('slash commands', () => {
  it('serialize to valid registration payloads', () => {
    for (const command of commands) {
      const json = command.data.toJSON();
      expect(json.name).toMatch(/^[\p{Ll}\p{N}_-]{1,32}$/u);
      expect(json.description.length).toBeGreaterThan(0);
      expect(json.description.length).toBeLessThanOrEqual(100);
    }
  });

  it('have unique names', () => {
    const names = commands.map((command) => command.data.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('applies defaults', () => {
    const config = loadConfig({ DISCORD_TOKEN: 't', DISCORD_CLIENT_ID: 'c', DISCORD_GUILD_ID: '' });
    expect(config.DISCORD_GUILD_ID).toBeUndefined();
    expect(config.REMINDER_CHECK_INTERVAL_SECONDS).toBe(15);
    expect(config.DATABASE_PATH).toBe('./data/lembrabot.db');
  });

  it('reports missing variables', () => {
    expect(() => loadConfig({})).toThrow(/DISCORD_TOKEN/);
  });
});

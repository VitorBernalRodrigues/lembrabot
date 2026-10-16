import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { MIGRATIONS, migrate, openDatabase, type DB } from '../src/db/database.js';

const schemaVersion = (db: DB) => db.pragma('user_version', { simple: true });

const tableNames = (db: DB) =>
  db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .pluck()
    .all();

describe('migrations', () => {
  it('creates the full schema on a new database', () => {
    const db = openDatabase(':memory:');

    expect(schemaVersion(db)).toBe(MIGRATIONS.length);
    expect(tableNames(db)).toEqual(['poll_votes', 'polls', 'reminders']);
  });

  it('does nothing when the schema is up to date', () => {
    const db = openDatabase(':memory:');
    migrate(db);

    expect(schemaVersion(db)).toBe(MIGRATIONS.length);
  });

  it('upgrades an existing database without losing data', () => {
    const db = new Database(':memory:');
    migrate(db, MIGRATIONS.slice(0, 1));
    db.prepare(
      `INSERT INTO reminders (user_id, channel_id, message, due_at, created_at) VALUES ('u1', 'c1', 'hi', 1, 1)`,
    ).run();

    migrate(db);

    expect(schemaVersion(db)).toBe(MIGRATIONS.length);
    expect(tableNames(db)).toContain('polls');
    expect(db.prepare(`SELECT COUNT(*) FROM reminders`).pluck().get()).toBe(1);
  });
});

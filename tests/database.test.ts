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
    expect(tableNames(db)).toEqual(['reminders']);
  });

  it('does nothing when the schema is up to date', () => {
    const db = openDatabase(':memory:');
    migrate(db);

    expect(schemaVersion(db)).toBe(MIGRATIONS.length);
  });
});

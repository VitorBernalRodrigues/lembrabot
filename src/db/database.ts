import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type DB = Database.Database;

export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE reminders (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      TEXT    NOT NULL,
    guild_id     TEXT,
    channel_id   TEXT    NOT NULL,
    message      TEXT    NOT NULL,
    due_at       INTEGER NOT NULL,
    created_at   INTEGER NOT NULL,
    delivered_at INTEGER
  );
  CREATE INDEX idx_reminders_pending ON reminders (due_at) WHERE delivered_at IS NULL;
  CREATE INDEX idx_reminders_user ON reminders (user_id);
  `,
];

/** Applies pending migrations, tracking the schema version in SQLite's user_version. */
export function migrate(db: DB, migrations: readonly string[] = MIGRATIONS): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let version = current; version < migrations.length; version++) {
    db.transaction(() => {
      db.exec(migrations[version]!);
      db.pragma(`user_version = ${version + 1}`);
    })();
  }
}

/** Opens (or creates) the database and runs migrations. Use ":memory:" in tests. */
export function openDatabase(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

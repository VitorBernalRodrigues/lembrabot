import type { DB } from './database.js';

export interface Reminder {
  id: number;
  userId: string;
  guildId: string | null;
  channelId: string;
  message: string;
  dueAt: number;
  createdAt: number;
  deliveredAt: number | null;
}

export interface NewReminder {
  userId: string;
  guildId: string | null;
  channelId: string;
  message: string;
  dueAt: number;
}

interface ReminderRow {
  id: number;
  user_id: string;
  guild_id: string | null;
  channel_id: string;
  message: string;
  due_at: number;
  created_at: number;
  delivered_at: number | null;
}

const toReminder = (row: ReminderRow): Reminder => ({
  id: row.id,
  userId: row.user_id,
  guildId: row.guild_id,
  channelId: row.channel_id,
  message: row.message,
  dueAt: row.due_at,
  createdAt: row.created_at,
  deliveredAt: row.delivered_at,
});

export const MAX_PENDING_PER_USER = 25;

export class ReminderRepository {
  constructor(
    private readonly db: DB,
    private readonly now: () => number = Date.now,
  ) {}

  create(input: NewReminder): Reminder {
    const createdAt = this.now();
    const result = this.db
      .prepare(
        `INSERT INTO reminders (user_id, guild_id, channel_id, message, due_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(input.userId, input.guildId, input.channelId, input.message, input.dueAt, createdAt);

    return { ...input, id: Number(result.lastInsertRowid), createdAt, deliveredAt: null };
  }

  /** A user's pending reminders, soonest first. */
  listPendingByUser(userId: string): Reminder[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM reminders
         WHERE user_id = ? AND delivered_at IS NULL
         ORDER BY due_at ASC`,
      )
      .all(userId) as ReminderRow[];
    return rows.map(toReminder);
  }

  countPendingByUser(userId: string): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) AS total FROM reminders WHERE user_id = ? AND delivered_at IS NULL`)
      .get(userId) as { total: number };
    return row.total;
  }

  /** Reminders whose due time has passed and that have not been delivered yet. */
  findDue(limit = 50): Reminder[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM reminders
         WHERE delivered_at IS NULL AND due_at <= ?
         ORDER BY due_at ASC
         LIMIT ?`,
      )
      .all(this.now(), limit) as ReminderRow[];
    return rows.map(toReminder);
  }

  markDelivered(id: number): void {
    this.db.prepare(`UPDATE reminders SET delivered_at = ? WHERE id = ?`).run(this.now(), id);
  }

  /** Deletes a pending reminder owned by `userId`. Returns true if something was deleted. */
  cancel(id: number, userId: string): boolean {
    const result = this.db
      .prepare(`DELETE FROM reminders WHERE id = ? AND user_id = ? AND delivered_at IS NULL`)
      .run(id, userId);
    return result.changes > 0;
  }
}

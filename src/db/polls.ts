import type { DB } from './database.js';

export interface Poll {
  id: number;
  guildId: string | null;
  channelId: string;
  messageId: string | null;
  authorId: string;
  question: string;
  options: string[];
  createdAt: number;
  closedAt: number | null;
}

export interface NewPoll {
  guildId: string | null;
  channelId: string;
  authorId: string;
  question: string;
  options: string[];
}

export type VoteResult = 'voted' | 'changed' | 'removed' | 'closed' | 'not_found' | 'invalid_option';

interface PollRow {
  id: number;
  guild_id: string | null;
  channel_id: string;
  message_id: string | null;
  author_id: string;
  question: string;
  options: string;
  created_at: number;
  closed_at: number | null;
}

const toPoll = (row: PollRow): Poll => ({
  id: row.id,
  guildId: row.guild_id,
  channelId: row.channel_id,
  messageId: row.message_id,
  authorId: row.author_id,
  question: row.question,
  options: JSON.parse(row.options) as string[],
  createdAt: row.created_at,
  closedAt: row.closed_at,
});

export class PollRepository {
  constructor(
    private readonly db: DB,
    private readonly now: () => number = Date.now,
  ) {}

  create(input: NewPoll): Poll {
    const createdAt = this.now();
    const result = this.db
      .prepare(
        `INSERT INTO polls (guild_id, channel_id, author_id, question, options, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(input.guildId, input.channelId, input.authorId, input.question, JSON.stringify(input.options), createdAt);

    return { ...input, id: Number(result.lastInsertRowid), messageId: null, createdAt, closedAt: null };
  }

  findById(id: number): Poll | null {
    const row = this.db.prepare(`SELECT * FROM polls WHERE id = ?`).get(id) as PollRow | undefined;
    return row ? toPoll(row) : null;
  }

  setMessageId(id: number, messageId: string): void {
    this.db.prepare(`UPDATE polls SET message_id = ? WHERE id = ?`).run(messageId, id);
  }

  /**
   * Records a vote. Each user has a single vote per poll: voting for another
   * option moves the vote, and voting for the same option again removes it.
   */
  vote(pollId: number, userId: string, optionIndex: number): VoteResult {
    return this.db.transaction((): VoteResult => {
      const poll = this.findById(pollId);
      if (!poll) return 'not_found';
      if (poll.closedAt !== null) return 'closed';
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) {
        return 'invalid_option';
      }

      const existing = this.db
        .prepare(`SELECT option_index FROM poll_votes WHERE poll_id = ? AND user_id = ?`)
        .get(pollId, userId) as { option_index: number } | undefined;

      if (existing?.option_index === optionIndex) {
        this.db.prepare(`DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?`).run(pollId, userId);
        return 'removed';
      }

      this.db
        .prepare(
          `INSERT INTO poll_votes (poll_id, user_id, option_index, voted_at) VALUES (?, ?, ?, ?)
           ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = excluded.option_index, voted_at = excluded.voted_at`,
        )
        .run(pollId, userId, optionIndex, this.now());

      return existing ? 'changed' : 'voted';
    })();
  }

  /** Vote count per option, in the same order as `poll.options`. */
  tally(pollId: number): number[] {
    const poll = this.findById(pollId);
    if (!poll) return [];

    const counts: number[] = poll.options.map(() => 0);
    const rows = this.db
      .prepare(`SELECT option_index, COUNT(*) AS total FROM poll_votes WHERE poll_id = ? GROUP BY option_index`)
      .all(pollId) as { option_index: number; total: number }[];

    for (const row of rows) counts[row.option_index] = row.total;
    return counts;
  }

  /** Closes the poll if `userId` is its author. Returns true if it was closed by this call. */
  close(pollId: number, userId: string): boolean {
    const result = this.db
      .prepare(`UPDATE polls SET closed_at = ? WHERE id = ? AND author_id = ? AND closed_at IS NULL`)
      .run(this.now(), pollId, userId);
    return result.changes > 0;
  }
}

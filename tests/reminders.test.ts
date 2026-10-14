import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db/database.js';
import { ReminderRepository } from '../src/db/reminders.js';

describe('ReminderRepository', () => {
  let now: number;
  let repo: ReminderRepository;

  const base = { guildId: 'g1', channelId: 'c1', message: 'beber água' };

  beforeEach(() => {
    now = 1_000_000;
    repo = new ReminderRepository(openDatabase(':memory:'), () => now);
  });

  it('creates and lists pending reminders by due date', () => {
    repo.create({ ...base, userId: 'u1', dueAt: now + 2000 });
    repo.create({ ...base, userId: 'u1', dueAt: now + 1000 });
    repo.create({ ...base, userId: 'u2', dueAt: now + 500 });

    const pending = repo.listPendingByUser('u1');
    expect(pending.map((r) => r.dueAt)).toEqual([now + 1000, now + 2000]);
    expect(repo.countPendingByUser('u1')).toBe(2);
  });

  it('returns only reminders that are already due', () => {
    const past = repo.create({ ...base, userId: 'u1', dueAt: now - 1 });
    repo.create({ ...base, userId: 'u1', dueAt: now + 60_000 });

    expect(repo.findDue().map((r) => r.id)).toEqual([past.id]);
  });

  it('does not return delivered reminders', () => {
    const reminder = repo.create({ ...base, userId: 'u1', dueAt: now });
    repo.markDelivered(reminder.id);

    expect(repo.findDue()).toEqual([]);
    expect(repo.listPendingByUser('u1')).toEqual([]);
  });

  it('only lets the owner cancel', () => {
    const reminder = repo.create({ ...base, userId: 'u1', dueAt: now + 1000 });

    expect(repo.cancel(reminder.id, 'other-user')).toBe(false);
    expect(repo.cancel(reminder.id, 'u1')).toBe(true);
    expect(repo.cancel(reminder.id, 'u1')).toBe(false);
  });
});

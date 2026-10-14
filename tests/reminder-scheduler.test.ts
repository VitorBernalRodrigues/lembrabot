import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openDatabase } from '../src/db/database.js';
import { ReminderRepository, type Reminder } from '../src/db/reminders.js';
import { ReminderScheduler } from '../src/services/reminder-scheduler.js';

const silentLogger = { info: () => {}, error: () => {} };

describe('ReminderScheduler', () => {
  let now: number;
  let repo: ReminderRepository;

  const add = (dueAt: number) =>
    repo.create({ userId: 'u1', guildId: 'g1', channelId: 'c1', message: 'test', dueAt });

  beforeEach(() => {
    now = 50_000;
    repo = new ReminderRepository(openDatabase(':memory:'), () => now);
  });

  it('delivers only due reminders and never twice', async () => {
    const due = add(now - 1);
    add(now + 10_000);
    const deliver = vi.fn(async (_reminder: Reminder) => {});
    const scheduler = new ReminderScheduler(repo, deliver, 1000, silentLogger);

    expect(await scheduler.tick()).toBe(1);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(deliver.mock.calls[0]?.[0].id).toBe(due.id);

    expect(await scheduler.tick()).toBe(0);
    expect(deliver).toHaveBeenCalledTimes(1);
  });

  it('delivers remaining reminders once they come due', async () => {
    add(now + 10_000);
    const deliver = vi.fn(async () => {});
    const scheduler = new ReminderScheduler(repo, deliver, 1000, silentLogger);

    expect(await scheduler.tick()).toBe(0);
    now += 10_000;
    expect(await scheduler.tick()).toBe(1);
  });

  it('a failed delivery neither blocks the others nor is retried forever', async () => {
    add(now - 2);
    add(now - 1);
    const deliver = vi
      .fn<(reminder: Reminder) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Unknown Channel'))
      .mockResolvedValueOnce();
    const logger = { info: vi.fn(), error: vi.fn() };
    const scheduler = new ReminderScheduler(repo, deliver, 1000, logger);

    expect(await scheduler.tick()).toBe(1);
    expect(logger.error).toHaveBeenCalledOnce();
    expect(repo.findDue()).toEqual([]);
  });
});

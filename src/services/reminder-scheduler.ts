import type { Reminder, ReminderRepository } from '../db/reminders.js';

export type DeliverFn = (reminder: Reminder) => Promise<void>;

export interface SchedulerLogger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

/**
 * Periodically looks up due reminders in the database and delivers them.
 * Since state lives in SQLite, reminders survive restarts: anything that came
 * due while the bot was offline is delivered on the first tick.
 */
export class ReminderScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly reminders: ReminderRepository,
    private readonly deliver: DeliverFn,
    private readonly intervalMs: number,
    private readonly logger: SchedulerLogger = console,
  ) {}

  start(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Runs a single check. Returns how many reminders were delivered. */
  async tick(): Promise<number> {
    // Skip overlapping ticks when a delivery takes longer than the interval.
    if (this.running) return 0;
    this.running = true;

    let delivered = 0;
    try {
      for (const reminder of this.reminders.findDue()) {
        try {
          await this.deliver(reminder);
          delivered++;
        } catch (error) {
          this.logger.error(`Failed to deliver reminder #${reminder.id}`, error);
        } finally {
          // Mark as processed even on failure (deleted channel, closed DMs, ...)
          // so a broken reminder is not retried forever.
          this.reminders.markDelivered(reminder.id);
        }
      }
    } finally {
      this.running = false;
    }

    if (delivered > 0) this.logger.info(`Delivered ${delivered} reminder(s)`);
    return delivered;
  }
}

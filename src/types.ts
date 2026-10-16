import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  SharedSlashCommand,
} from 'discord.js';
import type { PollRepository } from './db/polls.js';
import type { ReminderRepository } from './db/reminders.js';

/** Dependencies injected into handlers instead of module-level globals, which keeps them testable. */
export interface Context {
  reminders: ReminderRepository;
  polls: PollRepository;
}

export interface Command {
  data: SharedSlashCommand;
  execute(interaction: ChatInputCommandInteraction, ctx: Context): Promise<void>;
}

export interface ButtonHandler {
  /** customId prefix this handler responds to, e.g. "poll". */
  prefix: string;
  execute(interaction: ButtonInteraction, args: string[], ctx: Context): Promise<void>;
}

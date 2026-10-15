import { Client, Events, GatewayIntentBits, userMention } from 'discord.js';
import { buttonHandlers, commands } from './commands/index.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/database.js';
import { ReminderRepository, type Reminder } from './db/reminders.js';
import { createInteractionRouter } from './interactions/router.js';
import { ReminderScheduler } from './services/reminder-scheduler.js';

const config = loadConfig();
const db = openDatabase(config.DATABASE_PATH);
const ctx = { reminders: new ReminderRepository(db) };

// Slash commands and buttons don't need any privileged intents.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function deliverReminder(reminder: Reminder): Promise<void> {
  const content = `⏰ ${userMention(reminder.userId)}, você pediu para eu te lembrar:\n> ${reminder.message}`;

  const channel = await client.channels.fetch(reminder.channelId).catch(() => null);
  if (channel?.isSendable()) {
    await channel.send({ content, allowedMentions: { users: [reminder.userId] } });
    return;
  }

  // Fall back to a DM when the channel is gone or the bot lost access to it.
  const user = await client.users.fetch(reminder.userId);
  await user.send(content);
}

const scheduler = new ReminderScheduler(
  ctx.reminders,
  deliverReminder,
  config.REMINDER_CHECK_INTERVAL_SECONDS * 1000,
);

client.once(Events.ClientReady, (ready) => {
  console.log(`Logged in as ${ready.user.tag} (${ready.guilds.cache.size} guilds)`);
  scheduler.start();
});

client.on(Events.InteractionCreate, createInteractionRouter(commands, buttonHandlers, ctx));

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);
  scheduler.stop();
  void client.destroy().finally(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

await client.login(config.DISCORD_TOKEN);

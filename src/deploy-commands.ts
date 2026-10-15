import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';
import { loadConfig } from './config.js';

/**
 * Registers the slash commands with Discord. Run it whenever a command is added or changed.
 * With DISCORD_GUILD_ID set, commands are registered instantly to that guild only (useful for testing).
 */
const config = loadConfig();
const rest = new REST().setToken(config.DISCORD_TOKEN);
const body = commands.map((command) => command.data.toJSON());

const route = config.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID)
  : Routes.applicationCommands(config.DISCORD_CLIENT_ID);

await rest.put(route, { body });
console.log(
  `Registered ${body.length} command(s) ${config.DISCORD_GUILD_ID ? `in guild ${config.DISCORD_GUILD_ID}` : 'globally'}`,
);

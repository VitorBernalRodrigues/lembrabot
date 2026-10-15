import { MessageFlags, type Interaction } from 'discord.js';
import type { ButtonHandler, Command, Context } from '../types.js';

const ERROR_MESSAGE = '😵 Algo deu errado ao executar isso. Tente de novo em instantes.';

/** Dispatches each interaction to its command or button handler, with centralized error handling. */
export function createInteractionRouter(commands: Command[], buttons: ButtonHandler[], ctx: Context) {
  const commandsByName = new Map(commands.map((command) => [command.data.name, command]));
  const buttonsByPrefix = new Map(buttons.map((handler) => [handler.prefix, handler]));

  return async function route(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commandsByName.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, ctx);
        return;
      }

      if (interaction.isButton()) {
        const [prefix = '', ...args] = interaction.customId.split(':');
        await buttonsByPrefix.get(prefix)?.execute(interaction, args, ctx);
      }
    } catch (error) {
      console.error('Failed to handle interaction', error);
      if (!interaction.isRepliable()) return;
      const payload = { content: ERROR_MESSAGE, flags: MessageFlags.Ephemeral } as const;
      await (interaction.replied || interaction.deferred
        ? interaction.followUp(payload)
        : interaction.reply(payload)
      ).catch(() => undefined);
    }
  };
}

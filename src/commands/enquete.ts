import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';
import { parseOptions } from '../utils/poll-format.js';
import { buildPollMessage } from '../utils/poll-message.js';

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 10;
export const MAX_OPTION_LENGTH = 55;

export const enquete: Command = {
  data: new SlashCommandBuilder()
    .setName('enquete')
    .setDescription('Cria uma enquete com botões de votação')
    .addStringOption((opt) =>
      opt.setName('pergunta').setDescription('O que você quer perguntar').setMaxLength(200).setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('opcoes')
        .setDescription(`De ${MIN_OPTIONS} a ${MAX_OPTIONS} opções separadas por ";". Ex.: Pizza; Sushi; Hambúrguer`)
        .setMaxLength(1000)
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction, { polls }) {
    const question = interaction.options.getString('pergunta', true);
    const options = parseOptions(interaction.options.getString('opcoes', true));

    const problem =
      options.length < MIN_OPTIONS
        ? `Preciso de pelo menos ${MIN_OPTIONS} opções diferentes, separadas por \`;\`.`
        : options.length > MAX_OPTIONS
          ? `O máximo é ${MAX_OPTIONS} opções.`
          : options.find((option) => option.length > MAX_OPTION_LENGTH)
            ? `Cada opção pode ter no máximo ${MAX_OPTION_LENGTH} caracteres.`
            : null;

    if (problem) {
      await interaction.reply({ content: problem, flags: MessageFlags.Ephemeral });
      return;
    }

    const poll = polls.create({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      authorId: interaction.user.id,
      question,
      options,
    });

    const response = await interaction.reply({
      ...buildPollMessage(poll, polls.tally(poll.id)),
      withResponse: true,
    });

    const messageId = response.resource?.message?.id;
    if (messageId) polls.setMessageId(poll.id, messageId);
  },
};

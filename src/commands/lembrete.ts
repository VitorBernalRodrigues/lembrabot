import {
  MessageFlags,
  SlashCommandBuilder,
  TimestampStyles,
  time,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { MAX_PENDING_PER_USER } from '../db/reminders.js';
import type { Command, Context } from '../types.js';
import { formatDuration, parseDuration } from '../utils/duration.js';

const MAX_MESSAGE_LENGTH = 500;

export const lembrete: Command = {
  data: new SlashCommandBuilder()
    .setName('lembrete')
    .setDescription('Crie, liste e cancele lembretes')
    .addSubcommand((sub) =>
      sub
        .setName('criar')
        .setDescription('Agenda um lembrete')
        .addStringOption((opt) =>
          opt.setName('quando').setDescription('Daqui a quanto tempo. Ex.: 10m, 2h, 1d12h, 1w').setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName('mensagem')
            .setDescription('Do que eu devo te lembrar')
            .setMaxLength(MAX_MESSAGE_LENGTH)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName('listar').setDescription('Mostra os seus lembretes pendentes'))
    .addSubcommand((sub) =>
      sub
        .setName('cancelar')
        .setDescription('Cancela um lembrete pendente')
        .addIntegerOption((opt) =>
          opt.setName('id').setDescription('ID mostrado em /lembrete listar').setMinValue(1).setRequired(true),
        ),
    ),

  async execute(interaction, ctx) {
    switch (interaction.options.getSubcommand()) {
      case 'criar':
        return create(interaction, ctx);
      case 'listar':
        return list(interaction, ctx);
      case 'cancelar':
        return cancel(interaction, ctx);
    }
  },
};

async function create(interaction: ChatInputCommandInteraction, { reminders }: Context) {
  const when = interaction.options.getString('quando', true);
  const message = interaction.options.getString('mensagem', true);
  const duration = parseDuration(when);

  if (duration === null) {
    await interaction.reply({
      content: `Não entendi \`${when}\`. Use algo como \`10m\`, \`2h\`, \`1d12h\` ou \`1w\` (mínimo 10s, máximo 1 ano).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (reminders.countPendingByUser(interaction.user.id) >= MAX_PENDING_PER_USER) {
    await interaction.reply({
      content: `Você já tem ${MAX_PENDING_PER_USER} lembretes pendentes. Cancele algum com \`/lembrete cancelar\`.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const reminder = reminders.create({
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    message,
    dueAt: Date.now() + duration,
  });

  const dueDate = new Date(reminder.dueAt);
  await interaction.reply({
    content:
      `⏰ Combinado! Vou te lembrar ${time(dueDate, TimestampStyles.RelativeTime)} ` +
      `(${time(dueDate, TimestampStyles.ShortDateTime)}, daqui a ${formatDuration(duration)}).\n` +
      `> ${message}\n-# Lembrete #${reminder.id}`,
    flags: MessageFlags.Ephemeral,
  });
}

async function list(interaction: ChatInputCommandInteraction, { reminders }: Context) {
  const pending = reminders.listPendingByUser(interaction.user.id);

  if (pending.length === 0) {
    await interaction.reply({
      content: 'Você não tem lembretes pendentes. Crie um com `/lembrete criar`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const lines = pending.map((reminder) => {
    const preview = reminder.message.length > 80 ? `${reminder.message.slice(0, 77)}...` : reminder.message;
    return `**#${reminder.id}** · ${time(new Date(reminder.dueAt), TimestampStyles.RelativeTime)} · ${preview}`;
  });

  await interaction.reply({
    content: `📋 Seus lembretes pendentes (${pending.length}):\n${lines.join('\n')}`,
    flags: MessageFlags.Ephemeral,
  });
}

async function cancel(interaction: ChatInputCommandInteraction, { reminders }: Context) {
  const id = interaction.options.getInteger('id', true);
  const removed = reminders.cancel(id, interaction.user.id);

  await interaction.reply({
    content: removed
      ? `🗑️ Lembrete #${id} cancelado.`
      : `Não achei um lembrete pendente #${id} seu. Veja os IDs com \`/lembrete listar\`.`,
    flags: MessageFlags.Ephemeral,
  });
}

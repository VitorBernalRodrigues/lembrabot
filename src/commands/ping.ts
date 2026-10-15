import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';

export const ping: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Mostra se o bot está online e a latência'),

  async execute(interaction) {
    const sent = Date.now();
    await interaction.reply({ content: '🏓 Pong!' });
    const roundTrip = Date.now() - sent;
    await interaction.editReply(
      `🏓 Pong! Ida e volta: **${roundTrip}ms** · WebSocket: **${Math.round(interaction.client.ws.ping)}ms**`,
    );
  },
};

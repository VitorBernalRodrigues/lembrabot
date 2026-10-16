import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';

export const ajuda: Command = {
  data: new SlashCommandBuilder().setName('ajuda').setDescription('Lista os comandos do bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🤖 Comandos do Lembrabot')
      .addFields(
        {
          name: '⏰ Lembretes',
          value: [
            '`/lembrete criar quando:<tempo> mensagem:<texto>`: agenda um lembrete. Ex.: `quando: 1h30m`',
            '`/lembrete listar`: mostra os seus lembretes pendentes',
            '`/lembrete cancelar id:<número>`: cancela um lembrete',
          ].join('\n'),
        },
        {
          name: '📊 Enquetes',
          value: '`/enquete pergunta:<texto> opcoes:<a; b; c>`: cria uma enquete com botões. Clique de novo para tirar o voto.',
        },
        { name: '🔧 Outros', value: '`/ping`: latência do bot\n`/ajuda`: esta mensagem' },
      )
      .setFooter({ text: 'Formatos de tempo: s, m, h, d, w (segundos, minutos, horas, dias, semanas)' });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

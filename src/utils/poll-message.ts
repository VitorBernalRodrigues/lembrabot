import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, userMention } from 'discord.js';
import type { Poll } from '../db/polls.js';
import { formatResults } from './poll-format.js';

const BUTTONS_PER_ROW = 5;
const COLOR_OPEN = 0x5865f2;
const COLOR_CLOSED = 0x4f545c;

export const pollVoteId = (pollId: number, optionIndex: number) => `poll:vote:${pollId}:${optionIndex}`;
export const pollCloseId = (pollId: number) => `poll:close:${pollId}`;

/** Builds the poll embed and buttons from its current state. */
export function buildPollMessage(poll: Poll, counts: number[]) {
  const closed = poll.closedAt !== null;
  const total = counts.reduce((sum, count) => sum + count, 0);

  const embed = new EmbedBuilder()
    .setColor(closed ? COLOR_CLOSED : COLOR_OPEN)
    .setTitle(`📊 ${poll.question}`)
    .setDescription(formatResults(poll.options, counts))
    .setFooter({ text: `Enquete #${poll.id} · ${total} ${total === 1 ? 'voto' : 'votos'}${closed ? ' · encerrada' : ''}` })
    .setTimestamp(poll.createdAt);

  if (closed && total > 0) {
    const max = Math.max(...counts);
    const winners = poll.options.filter((_, index) => counts[index] === max);
    embed.addFields({ name: winners.length > 1 ? '🏆 Empate' : '🏆 Vencedora', value: winners.join(', ') });
  }
  embed.addFields({ name: 'Criada por', value: userMention(poll.authorId), inline: true });

  const voteButtons = poll.options.map((option, index) =>
    new ButtonBuilder()
      .setCustomId(pollVoteId(poll.id, index))
      .setLabel(`${index + 1}. ${option}`.slice(0, 80))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(closed),
  );

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < voteButtons.length; i += BUTTONS_PER_ROW) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(voteButtons.slice(i, i + BUTTONS_PER_ROW)));
  }

  if (!closed) {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(pollCloseId(poll.id)).setLabel('Encerrar').setStyle(ButtonStyle.Danger),
      ),
    );
  }

  return { embeds: [embed], components: rows };
}

import { MessageFlags } from 'discord.js';
import type { VoteResult } from '../db/polls.js';
import type { ButtonHandler } from '../types.js';
import { buildPollMessage } from '../utils/poll-message.js';

const VOTE_FEEDBACK: Record<VoteResult, string> = {
  voted: '✅ Voto registrado!',
  changed: '🔄 Voto trocado!',
  removed: '↩️ Voto removido.',
  closed: 'Essa enquete já foi encerrada.',
  not_found: 'Não encontrei essa enquete.',
  invalid_option: 'Opção inválida.',
};

/** Handles the "poll:vote:<id>:<option>" and "poll:close:<id>" buttons. */
export const pollButtons: ButtonHandler = {
  prefix: 'poll',

  async execute(interaction, [action, rawPollId, rawOption], { polls }) {
    const pollId = Number(rawPollId);

    if (action === 'vote') {
      const optionIndex = Number(rawOption);
      const result = polls.vote(pollId, interaction.user.id, optionIndex);
      const poll = polls.findById(pollId);

      if (!poll) {
        await interaction.reply({ content: VOTE_FEEDBACK.not_found, flags: MessageFlags.Ephemeral });
        return;
      }

      await interaction.update(buildPollMessage(poll, polls.tally(pollId)));

      const option = poll.options[optionIndex];
      const feedback =
        (result === 'voted' || result === 'changed') && option
          ? `${VOTE_FEEDBACK[result]} (${option})`
          : VOTE_FEEDBACK[result];
      await interaction.followUp({ content: feedback, flags: MessageFlags.Ephemeral });
      return;
    }

    if (action === 'close') {
      const poll = polls.findById(pollId);
      if (!poll) {
        await interaction.reply({ content: VOTE_FEEDBACK.not_found, flags: MessageFlags.Ephemeral });
        return;
      }
      if (!polls.close(pollId, interaction.user.id)) {
        await interaction.reply({
          content: 'Só quem criou a enquete pode encerrá-la.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.update(buildPollMessage(polls.findById(pollId)!, polls.tally(pollId)));
    }
  },
};

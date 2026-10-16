import { describe, expect, it } from 'vitest';
import type { Poll } from '../src/db/polls.js';
import { buildPollMessage } from '../src/utils/poll-message.js';

const poll: Poll = {
  id: 7,
  guildId: 'g1',
  channelId: 'c1',
  messageId: null,
  authorId: '123',
  question: 'Melhor linguagem?',
  options: ['TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C#'],
  createdAt: 0,
  closedAt: null,
};

describe('buildPollMessage', () => {
  it('renders one button per option, 5 per row, plus a close button', () => {
    const { components } = buildPollMessage(poll, [0, 0, 0, 0, 0, 0]);
    const rows = components.map((row) => row.toJSON().components.length);
    expect(rows).toEqual([5, 1, 1]);
  });

  it('disables buttons and shows the winner once closed', () => {
    const { embeds, components } = buildPollMessage({ ...poll, closedAt: 1 }, [3, 1, 0, 0, 0, 0]);
    const buttons = components.flatMap((row) => row.toJSON().components) as { disabled?: boolean }[];

    expect(buttons).toHaveLength(6);
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(embeds[0]?.toJSON().fields?.[0]).toMatchObject({ name: '🏆 Vencedora', value: 'TypeScript' });
  });

  it('shows a tie when options share the highest count', () => {
    const { embeds } = buildPollMessage({ ...poll, closedAt: 1 }, [2, 2, 0, 0, 0, 0]);
    expect(embeds[0]?.toJSON().fields?.[0]).toMatchObject({ name: '🏆 Empate', value: 'TypeScript, Python' });
  });
});

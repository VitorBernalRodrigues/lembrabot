import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db/database.js';
import { PollRepository, type Poll } from '../src/db/polls.js';

describe('PollRepository', () => {
  let repo: PollRepository;
  let poll: Poll;

  beforeEach(() => {
    repo = new PollRepository(openDatabase(':memory:'), () => 1_000);
    poll = repo.create({
      guildId: 'g1',
      channelId: 'c1',
      authorId: 'author',
      question: 'Qual o melhor lanche?',
      options: ['Pizza', 'Sushi', 'Hambúrguer'],
    });
  });

  it('persists and restores options', () => {
    expect(repo.findById(poll.id)?.options).toEqual(['Pizza', 'Sushi', 'Hambúrguer']);
  });

  it('counts one vote per user', () => {
    expect(repo.vote(poll.id, 'a', 0)).toBe('voted');
    expect(repo.vote(poll.id, 'b', 0)).toBe('voted');
    expect(repo.vote(poll.id, 'c', 2)).toBe('voted');

    expect(repo.tally(poll.id)).toEqual([2, 0, 1]);
  });

  it('moves the vote to another option and removes it on a repeat click', () => {
    repo.vote(poll.id, 'a', 0);
    expect(repo.vote(poll.id, 'a', 1)).toBe('changed');
    expect(repo.tally(poll.id)).toEqual([0, 1, 0]);

    expect(repo.vote(poll.id, 'a', 1)).toBe('removed');
    expect(repo.tally(poll.id)).toEqual([0, 0, 0]);
  });

  it('rejects unknown options and polls', () => {
    expect(repo.vote(poll.id, 'a', 3)).toBe('invalid_option');
    expect(repo.vote(poll.id, 'a', -1)).toBe('invalid_option');
    expect(repo.vote(9999, 'a', 0)).toBe('not_found');
  });

  it('only the author can close it, and closed polls reject votes', () => {
    expect(repo.close(poll.id, 'someone-else')).toBe(false);
    expect(repo.close(poll.id, 'author')).toBe(true);
    expect(repo.findById(poll.id)?.closedAt).toBe(1_000);
    expect(repo.vote(poll.id, 'a', 0)).toBe('closed');
  });
});

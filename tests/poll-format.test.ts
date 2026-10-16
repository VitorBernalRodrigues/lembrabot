import { describe, expect, it } from 'vitest';
import { formatResults, parseOptions, progressBar } from '../src/utils/poll-format.js';

describe('parseOptions', () => {
  it('splits on ";" and drops whitespace, empty and duplicate entries', () => {
    expect(parseOptions(' Pizza ; Sushi;; pizza ; Hambúrguer ')).toEqual(['Pizza', 'Sushi', 'Hambúrguer']);
  });
});

describe('progressBar', () => {
  it('fills proportionally to the total', () => {
    expect(progressBar(1, 4, 4)).toBe('▰▱▱▱ 25%');
    expect(progressBar(3, 3, 4)).toBe('▰▰▰▰ 100%');
  });

  it('handles zero total votes', () => {
    expect(progressBar(0, 0, 4)).toBe('▱▱▱▱ 0%');
  });
});

describe('formatResults', () => {
  it('pluralizes the vote label', () => {
    const text = formatResults(['Sim', 'Não'], [1, 2]);
    expect(text).toContain('**1. Sim**');
    expect(text).toContain('1 voto');
    expect(text).toContain('2 votos');
  });
});

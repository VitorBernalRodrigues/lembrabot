const BAR_SIZE = 12;

/** Renders a text progress bar such as "▰▰▰▱▱▱▱▱▱▱▱▱ 25%". */
export function progressBar(votes: number, total: number, size = BAR_SIZE): string {
  const ratio = total === 0 ? 0 : votes / total;
  const filled = Math.round(ratio * size);
  const percent = Math.round(ratio * 100);
  return `${'▰'.repeat(filled)}${'▱'.repeat(size - filled)} ${percent}%`;
}

/** One result block per option, ready to be used as the embed description. */
export function formatResults(options: string[], counts: number[]): string {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return options
    .map((option, index) => {
      const votes = counts[index] ?? 0;
      const label = votes === 1 ? 'voto' : 'votos';
      return `**${index + 1}. ${option}**\n${progressBar(votes, total)} · ${votes} ${label}`;
    })
    .join('\n\n');
}

/** Splits "Pizza; Burger ; Sushi" into trimmed options, dropping empty and duplicate entries. */
export function parseOptions(input: string): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const raw of input.split(';')) {
    const option = raw.trim();
    const key = option.toLowerCase();
    if (option && !seen.has(key)) {
      seen.add(key);
      options.push(option);
    }
  }
  return options;
}

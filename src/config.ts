import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  DISCORD_GUILD_ID: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  DATABASE_PATH: z.string().default('./data/lembrabot.db'),
  REMINDER_CHECK_INTERVAL_SECONDS: z.coerce.number().int().min(5).default(15),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid configuration. Check your .env file:\n${problems.join('\n')}`);
  }
  return result.data;
}

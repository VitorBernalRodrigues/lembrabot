# Lembrabot

[![CI](https://github.com/VitorBernalRodrigues/lembrabot/actions/workflows/ci.yml/badge.svg)](https://github.com/VitorBernalRodrigues/lembrabot/actions/workflows/ci.yml)

A Discord bot for reminders and polls, built with slash commands, TypeScript and SQLite.

> Work in progress. Reminders are working; polls are next.

## Features

- Persistent reminders stored in SQLite, delivered even after a restart.
- Flexible durations such as `10m`, `2h`, `1d12h` and `1w`.
- Falls back to a direct message when the original channel is no longer available.

## Commands

| Command | Description |
| --- | --- |
| `/lembrete criar quando:<duration> mensagem:<text>` | Schedules a reminder |
| `/lembrete listar` | Lists your pending reminders |
| `/lembrete cancelar id:<number>` | Cancels one of your pending reminders |
| `/ping` | Shows round-trip and WebSocket latency |
| `/ajuda` | Lists all commands |

## Getting started

Requires Node.js 22.12 or newer and an application in the [Discord Developer Portal](https://discord.com/developers/applications).

```bash
npm install
cp .env.example .env      # fill in DISCORD_TOKEN and DISCORD_CLIENT_ID
npm run deploy-commands   # register slash commands
npm run dev
```

## Development

```bash
npm test            # Vitest
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run build       # compile to dist/
```

## License

MIT

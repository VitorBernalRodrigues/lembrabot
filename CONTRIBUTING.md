# Contributing

Thanks for your interest in improving Lembrabot.

## Reporting bugs and requesting features

Open an [issue](https://github.com/VitorBernalRodrigues/lembrabot/issues/new/choose) using one of the templates. For bugs, include the steps to reproduce, what you expected and what happened.

## Development setup

```bash
git clone https://github.com/VitorBernalRodrigues/lembrabot.git
cd lembrabot
npm install
cp .env.example .env
npm run dev
```

## Workflow

1. Fork the repository and create a branch from `main`, for example `feat/poll-timeout` or `fix/reminder-dm`.
2. Make your changes, adding or updating tests where it makes sense.
3. Make sure everything passes locally:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. Open a pull request describing what changed and why.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat: add timeout option to polls
fix: deliver reminder by DM when channel is missing
docs: document configuration variables
```

Common types are `feat`, `fix`, `docs`, `test`, `refactor`, `chore` and `ci`.

## Code style

- TypeScript in strict mode, ES modules.
- Code, comments, logs and tests in English. Messages shown to Discord users are in Brazilian Portuguese.
- Keep Discord-specific code in `commands/` and `interactions/`, and business rules in `db/` and `services/`.

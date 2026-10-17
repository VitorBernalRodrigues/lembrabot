# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-17

### Added

- `/lembrete criar`, `/lembrete listar` and `/lembrete cancelar` commands.
- Duration parser supporting seconds, minutes, hours, days, weeks and combinations.
- Persistent reminder scheduler with DM fallback and failure isolation.
- `/enquete` command with vote buttons, live progress bars and author-only closing.
- `/ping` and `/ajuda` commands.
- SQLite storage with versioned migrations.
- Environment validation with Zod.
- Unit test suite with Vitest and a GitHub Actions CI pipeline.

[Unreleased]: https://github.com/VitorBernalRodrigues/lembrabot/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/VitorBernalRodrigues/lembrabot/releases/tag/v1.0.0

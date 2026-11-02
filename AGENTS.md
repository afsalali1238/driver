# AGENTS.md

This repository follows the instructions defined in `CLAUDE.md`.

## Key Rules:
1. **Completely Standalone**: This project operates with its own database (`DATABASE_SCHEMA.sql`) and API (`/services/telemetry-api`). It is not coupled with legacy `kasper-core` or external marketplace transactions.
2. **Trip-Gated Privacy**: Never write location trackers that run continuously in the background without an active `IN_PROGRESS` trip.
3. **Resilient Offline Architecture**: Every action in the mobile app must write to SQLite buffer before pushing to remote endpoints.
4. **Clean Zero-Jargon UI**: The mobile app UI must be accessible to field drivers in multiple languages (EN / AR / UR) with oversized touch targets and high-contrast styling.

---
description: "Use when modifying the Prisma schema, adding/removing/changing database fields, creating models, or making any database changes. Covers migration creation for NAS deployment."
applyTo: "prisma/schema.prisma"
---
# Database Migration Instructions

This app is deployed to a NAS server via Docker. Database migrations must be created locally and committed so they are synced and applied on deploy.

## Rules

- After ANY change to `prisma/schema.prisma`, create a migration by running:
  ```
  pnpm exec prisma migrate dev --name <descriptive_name>
  ```
- Use short, descriptive snake_case names (e.g., `add_is_favorite`, `add_genre_to_library`)
- Never use `prisma db push` — it doesn't create migration files and won't work on the NAS
- Never manually edit existing migration SQL files that have already been deployed
- Migration SQL files (`prisma/migrations/**/migration.sql`) MUST be committed to git — they are required for `prisma migrate deploy` on the NAS
- If a migration fails locally, use `prisma migrate reset` to start fresh (dev only)

## Deployment Flow

1. Schema change → `prisma migrate dev` locally → migration SQL created in `prisma/migrations/`
2. `deploy.sh` syncs files (including migrations) to NAS via rsync
3. Docker builds on NAS, baking `prisma/` into the image
4. `prisma migrate deploy` runs inside the container, applying pending migrations

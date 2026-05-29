Add a new field or model to the database using Prisma migrations.

Ask the user:
1. What change is needed (new field, new model, change a field type)?
2. Which model is affected (`Game`, `UserLibrary`, or a new one)?
3. Migration name (short snake_case description, e.g. `add_play_time`)

Then follow these steps:

## 1. Update the schema
Edit `prisma/schema.prisma`. Follow existing patterns:
- Optional fields: `fieldName  Type?`
- Fields with defaults: `fieldName  Type  @default(value)`
- New enums: define them before the model
- Add `@@index` for fields used in `where` clauses

## 2. Run the migration
```bash
npx prisma migrate dev --name <migration_name>
```
This creates a file in `prisma/migrations/` and updates the Prisma client.

## 3. Update affected API routes
After migration, update the routes that read/write the affected model:
- `src/app/api/library/route.ts` (POST saves game data)
- `src/app/api/library/refresh/route.ts` (bulk refresh)
- `src/app/api/library/[id]/route.ts` (PATCH/DELETE single entry)

## 4. Update TypeScript types
If the field should be exposed to the client:
- Add it to the `Game` interface in `src/app/components/GameCard.tsx` if it's game data
- Update the `toGame()` mapper in `src/app/page.tsx` if it needs to reach the dashboard

## 5. Verify
Run `npx tsc --noEmit` to confirm no type errors introduced.

⚠️ Never edit migration SQL files manually. If a migration has already been applied, create a new one.

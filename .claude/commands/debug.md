Diagnose and fix an issue in this project systematically.

Ask the user to describe the problem: what they expected vs what happened, and where (which page/component/API route).

Then follow this debugging sequence:

## 1. Locate the source
- If it's a UI issue: find the component file in `src/app/components/` or the page in `src/app/[page]/page.tsx`
- If it's a data issue: check the relevant API route in `src/app/api/`
- If it's a DB issue: check `prisma/schema.prisma` and the Prisma query

## 2. Common failure points in this project
- **Data not showing**: check if `rawData` field in the DB has the expected IGDB fields. The IGDB query might be missing a field (e.g. `screenshots.image_id`, `platforms.*`).
- **Stale data after mutation**: check that the mutation calls `queryClient.invalidateQueries({ queryKey: ['library'] })` on success.
- **Filter not working**: filters live in the URL via `useSearchParams`. Check `useFilters` hook — `setFilter` toggles values; `setSingleFilter` replaces them.
- **Sort order not persisting**: `sortOrder` is saved via `POST /api/library/reorder`. Check the field is being sorted by on the client (`pendingEntries` and `inProgressEntries` both need the sort).
- **IGDB API 401**: Twitch token expired. The token is cached in memory — restart the dev server or check `src/lib/igdb.ts`.
- **TypeScript error `any`**: never cast to `any`; define a proper interface or use `unknown`.

## 3. Inspect and fix
Read the relevant files, identify the root cause, and apply the minimal fix.
Do NOT add defensive error handling for impossible cases — fix the actual bug.

## 4. Verify
After fixing, explain what caused the bug and confirm it won't regress.

Run a quality check on the current changes before shipping.

## Automated checks
1. `npx tsc --noEmit` — TypeScript errors
2. `npx eslint src --ext .ts,.tsx` — lint errors
3. `npx prettier --check "src/**/*.{ts,tsx,css}"` — formatting

## Manual checklist
Go through each item and report pass / fail / not-applicable:

### Data layer
- [ ] No raw `any` types introduced — use `unknown` or a proper interface
- [ ] New Prisma queries include all fields needed by the client (`screenshots.image_id`, `platforms.*`, etc.)
- [ ] Mutations invalidate `['library']` query key on success
- [ ] API routes return typed responses, not bare objects

### UI
- [ ] New components use CSS variables (`var(--bg-1)`, etc.) not hardcoded colors
- [ ] Interactive elements have `cursor: pointer`
- [ ] Loading and empty states are handled
- [ ] Mobile layout works (check for `overflow: hidden` clipping, touch targets ≥ 44px)

### Correctness
- [ ] Filters use `setFilter` (toggle) for chips, `setSingleFilter` for dropdowns
- [ ] Sort order is applied to both `inProgressEntries` and `pendingEntries`
- [ ] No commented-out code left behind

Report each failing item with the file path and a suggested fix.

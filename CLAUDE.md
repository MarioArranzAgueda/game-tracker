# GameTracker — Project Instructions

## Stack
- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** (`@import "tailwindcss"` in globals.css — no config file needed)
- **Prisma 7** + **PostgreSQL** (via `src/lib/prisma.ts`)
- **TanStack Query v5** for all client-side data fetching
- **IGDB API** via `src/lib/igdb.ts` (`igdbQuery(endpoint, apicalypseString)`)
- **dnd-kit** for drag-and-drop

## Project structure
```
src/
  app/
    api/           # Next.js route handlers (server only)
    components/    # Shared UI components used across pages
    [page]/        # Each folder is a route (page.tsx)
    globals.css    # Design tokens + base styles
    layout.tsx     # Root layout (sidebar + providers)
  components/
    common/        # Generic low-level components (EmptyState, LoadingState, PageHeader…)
  hooks/           # Custom React hooks (useLibraryMutations, useFilters, useGameOverlay…)
  lib/             # Utilities and singletons (prisma, igdb, sortByTitle, constants)
prisma/
  schema.prisma    # Single source of truth for DB schema
```

## Coding rules

### TypeScript
- Never use `any`. Use `unknown` and narrow, or define a proper interface.
- Prefer `interface` over `type` for props and object shapes.
- All API route parameters and return values must be typed.

### React / Next.js
- `'use client'` only when the component uses state, effects, event handlers, or browser APIs. Route handlers and layout files are server-only.
- No unnecessary `useMemo`, `useCallback`, or `memo` — only add them when a real perf issue exists.
- All data mutations go through TanStack Query's `useMutation`. After success, invalidate `['library']` query key.
- Use `useQuery` for reads; pass `queryKey` arrays that uniquely identify the data.

### Styling
- Use **inline styles** with CSS custom properties (`var(--bg-1)`, `var(--accent)`, `var(--r-md)`, etc.). See `globals.css` for the full token set.
- Use **Tailwind utilities** only for structural/animation helpers (`flex`, `gap-*`, `animate-spin`, `overflow-hidden`). Do NOT use Tailwind for colors, spacing, or radii that have a CSS variable equivalent.
- Never add `.css` or `.scss` files. All new styles go in `globals.css` or inline.
- use className instead of style inline

### Components
- Create components in the `src/components/` folder for the generic components (buttons, carousel, card, etc)
- use DRY and SOLID patterns for the components
- Reutilise all you can for the components, utils, hooks, etc

### API routes
- Always use `Response.json(data, { status })` — never `NextResponse`.
- Wrap in `try/catch`. On error, log with `console.error` and return `Response.json({ error: '...' }, { status: 500 })`.
- IGDB calls live inside route handlers, never on the client.

### Naming
- Components: `PascalCase` named export (no default exports).
- Hooks: `camelCase`, prefix with `use`.
- Files: `camelCase.ts` for utilities/hooks, `PascalCase.tsx` for components, `route.ts` for API handlers.

## Design tokens quick reference
```
Surfaces:  --bg-0 (darkest) → --bg-3 (lightest panel)
Text:      --fg-0 (primary) → --fg-3 (disabled)
Accent:    --accent (purple) · --accent-soft (16% alpha) · --accent-glow (40%)
Status:    --st-wish · --st-pile · --st-playing · --st-done · --st-100
Spacing:   --s-1 (4px) → --s-12 (48px)
Radii:     --r-sm (6) · --r-md (10) · --r-lg (14) · --r-xl (20) · --r-pill (999)
Type:      --t-xs (11px) → --t-5xl (48px)
Shadows:   --shadow-1 · --shadow-2 · --shadow-glow
```

## Database (Prisma)
Models: `Game` (igdbId PK) and `UserLibrary` (status, sortOrder, isFavorite, personalScore…).
Raw IGDB response is stored in `Game.rawData` as JSON — always include `screenshots.image_id` and `platforms.*` when fetching.
Enum `GameStatus`: WISHLIST · PENDING · IN_PROGRESS · COMPLETED · FULL_COMPLETION.

## Do NOT
- Use `axios` in new code (only `src/lib/igdb.ts` uses it for IGDB; use `fetch` everywhere else).
- Commit `.env` or any credentials.
- Add error handling for impossible cases — only validate at system boundaries.
- Write comments that explain *what* the code does; only write them for non-obvious *why*.

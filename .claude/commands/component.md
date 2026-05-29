Scaffold a new React component for this project following its existing conventions.

Ask the user:
1. Component name (PascalCase)
2. Where to place it (`src/app/components/` for shared UI, `src/components/` for layout-level, or a specific page folder)
3. What the component does (brief description)

Then generate the component following these project conventions:
- `'use client'` directive only if the component uses state, effects, or browser APIs
- TypeScript `interface` for props (not `type`)
- Inline styles using CSS variables from the design system (`--bg-0..3`, `--fg-0..3`, `--accent`, `--accent-soft`, `--r-*` for border-radius, `--s-*` for spacing, `--t-*` for font sizes, `--shadow-1/2`)
- Tailwind utility classes only for layout helpers (`flex`, `gap-*`, `animate-spin`) — avoid Tailwind for colors or spacing that have a design token equivalent
- `lucide-react` for icons (already installed)
- No comments unless logic is non-obvious
- No default exports — use named exports

Reference components for style: `src/app/components/GameCard.tsx`, `src/app/components/HeroBanner.tsx`

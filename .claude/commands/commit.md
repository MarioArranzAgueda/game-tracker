Review staged changes and create a meaningful git commit for this project.

Steps:
1. Run `git diff --staged` and `git status` to see what's changing
2. Run `npx tsc --noEmit` to confirm no TypeScript errors
3. Run `npx eslint src --ext .ts,.tsx --max-warnings 0` to confirm no lint errors
4. If checks pass, draft a commit message following this format:

```
<type>(<scope>): <short description>

[optional body if the why is non-obvious]
```

Types: `feat` · `fix` · `refactor` · `style` · `chore`
Scope: the affected area (e.g. `library`, `igdb`, `carousel`, `hero-banner`, `prisma`)

Examples:
- `feat(library): add screenshots to rawData for HeroBanner`
- `fix(carousel): restore x-scroll on mobile by scoping touch-action to drag handle`
- `refactor(filters): use setFilter toggle instead of manual active check`

5. Create the commit. If lint or TypeScript fails, fix the issues first — never skip hooks.

Do NOT amend existing commits. Always create a new commit.
Do NOT push unless explicitly asked.

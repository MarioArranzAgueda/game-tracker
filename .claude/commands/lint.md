Run ESLint and Prettier checks on the project and fix any issues.

Steps:
1. Run `npx eslint src --ext .ts,.tsx` and capture output
2. Run `npx prettier --check "src/**/*.{ts,tsx,css}"` and capture output
3. If there are fixable issues, ask the user whether to auto-fix them with `eslint --fix` and `prettier --write`
4. Report any remaining issues that need manual attention

This project uses:
- ESLint with Next.js config (`eslint-config-next`)
- Prettier with `eslint-plugin-prettier`
- TypeScript strict mode

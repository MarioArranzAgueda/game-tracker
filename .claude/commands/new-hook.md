Create a new custom React hook for this project following its conventions.

Ask the user:
1. Hook name (e.g. `useGameStats`)
2. What it does — fetches data, performs mutations, or manages local state?
3. Which API endpoint(s) does it interact with?

Then generate the hook following these rules:
- File goes in `src/hooks/`, exported from `src/hooks/index.ts`
- `'use client'` at the top
- Use `useQuery` for reads and `useMutation` for writes (from `@tanstack/react-query`)
- After any successful mutation, call `queryClient.invalidateQueries({ queryKey: ['library'] })`
- Query keys must be arrays that uniquely identify the data: `['library']`, `['search', query]`, `['releases']`, etc.
- No `any` types — define interfaces for the data shape
- Keep the hook focused — one concern per hook (don't mix reads and mutations in the same hook unless they're tightly coupled)
- Return named fields, not a tuple

Example mutation hook pattern:
```ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdatePayload { id: number; value: string; }

export function useUpdateSomething() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const res = await fetch(`/api/library/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });
}
```

After generating, add the export to `src/hooks/index.ts`.

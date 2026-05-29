Scaffold a new API route for this project following its conventions.

Ask the user:
1. Route path (e.g. `/api/library/stats` → `src/app/api/library/stats/route.ts`)
2. HTTP methods needed (GET, POST, PATCH, DELETE)
3. What it does (brief description)
4. Does it need Prisma? Does it need IGDB?

Then generate the route following these rules:
- Import `NextRequest` from `'next/server'`
- Import `prisma` from `'@/lib/prisma'` if DB access is needed
- Import `igdbQuery` from `'@/lib/igdb'` if IGDB is needed
- Use `Response.json()` — never `NextResponse`
- Every handler wrapped in `try/catch`; on error return `Response.json({ error: 'message' }, { status: 500 })`
- Validate required body/query params at the top and return `{ status: 400 }` if missing
- No `any` types — define interfaces for request body and response shape
- No auth checks (this is a single-user personal app)

Example GET pattern:
```ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

  try {
    const result = await prisma.game.findUnique({ where: { igdbId: Number(id) } });
    if (!result) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(result);
  } catch (error) {
    console.error('Route error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

After generating, ask if the user also needs a TanStack Query hook to call this route from the client.

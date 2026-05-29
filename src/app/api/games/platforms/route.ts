import { igdbQuery } from '@/lib/igdb';

export async function GET() {
  const results = await igdbQuery(
    'platforms',
    `fields name, abbreviation, category;
     sort name asc;
     limit 500;`
  );

  const platforms = results.map((p: Record<string, unknown>) => ({
    id: p.id,
    name: p.name,
    abbreviation: p.abbreviation ?? null,
  }));

  return Response.json(platforms);
}

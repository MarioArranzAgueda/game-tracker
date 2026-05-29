import { prisma } from '@/lib/prisma';
import { igdbQuery } from '@/lib/igdb';

export async function POST() {
  try {
    const games = await prisma.game.findMany({
      where: { userLibrary: { some: {} } },
      select: { igdbId: true },
    });

    if (games.length === 0) {
      return Response.json({ message: 'No games to refresh', updated: 0 });
    }

    const ids = games.map((g) => g.igdbId);
    const query = `
      fields name, summary, storyline, cover.image_id,
             involved_companies.company.name, involved_companies.developer,
             total_rating, first_release_date,
             genres.name, platforms.name, platforms.abbreviation, platforms.platform_logo.image_id,
             screenshots.image_id, artworks.image_id;
      where id = (${ids.join(',')});
      limit 500;
    `;

    const results = await igdbQuery('games', query);

    let updated = 0;
    for (const g of results) {
      const companies = g.involved_companies as Record<string, unknown>[] | undefined;
      const devCompany = companies?.find((ic) => ic.developer);
      const developerName = (devCompany?.company as Record<string, unknown>)?.name as string | undefined;

      await prisma.game.update({
        where: { igdbId: g.id },
        data: {
          title: g.name,
          description: g.summary || g.storyline || null,
          coverUrl: g.cover?.image_id
            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
            : null,
          releaseYear: g.first_release_date
            ? new Date(g.first_release_date * 1000).getFullYear()
            : null,
          developer: developerName || null,
          avgRating: g.total_rating ? parseFloat(g.total_rating.toFixed(2)) : null,
          rawData: g,
        },
      });
      updated++;
    }

    return Response.json({ message: `Refreshed ${updated} games`, updated });
  } catch (error) {
    console.error('Refresh error:', error);
    return Response.json(
      { error: 'Failed to refresh library data' },
      { status: 500 }
    );
  }
}

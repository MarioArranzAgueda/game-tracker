import { igdbQuery } from '@/lib/igdb';

export async function GET() {
  const now = Math.floor(Date.now() / 1000);
  const threeMonthsAgo = now - 90 * 24 * 60 * 60;
  const sixMonthsAhead = now + 180 * 24 * 60 * 60;

  try {
    const [recent, upcoming] = await Promise.all([
      igdbQuery(
        'games',
        `fields name, cover.image_id, total_rating, first_release_date,
                involved_companies.company.name, involved_companies.developer,
                platforms.name, platforms.abbreviation, platforms.platform_logo.image_id, genres.name, hypes;
         where first_release_date >= ${threeMonthsAgo}
             & first_release_date <= ${now}
             & version_parent = null
             & themes != (42)
             & cover != null
             & total_rating_count > 3;
         sort first_release_date desc;
         limit 20;`
      ),
      igdbQuery(
        'games',
        `fields name, cover.image_id, first_release_date,
                involved_companies.company.name, involved_companies.developer,
                platforms.name, platforms.abbreviation, platforms.platform_logo.image_id, genres.name, hypes;
         where first_release_date > ${now}
             & first_release_date < ${sixMonthsAhead}
             & version_parent = null
             & themes != (42)
             & cover != null
             & hypes > 1;
         sort first_release_date asc;
         limit 20;`
      ),
    ]);

    const mapGame = (game: Record<string, unknown>) => {
      const companies = game.involved_companies as Array<Record<string, unknown>> | undefined;
      const devCompany = companies?.find((ic) => ic.developer);
      const developerName = devCompany
        ? ((devCompany.company as Record<string, unknown>)?.name as string)
        : null;

      return {
        igdbId: game.id,
        title: game.name,
        cover: game.cover
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${(game.cover as Record<string, unknown>).image_id}.jpg`
          : null,
        rating: game.total_rating
          ? Math.round((game.total_rating as number) * 10) / 100
          : null,
        releaseDate: game.first_release_date
          ? new Date((game.first_release_date as number) * 1000).toISOString()
          : null,
        year: game.first_release_date
          ? new Date((game.first_release_date as number) * 1000).getFullYear()
          : null,
        developer: developerName,
        platforms: (game.platforms as Array<{ id?: number; abbreviation?: string; name?: string; platform_logo?: { image_id: string } }> | undefined) || [],
        genres: (game.genres as Array<{ name: string }> | undefined)
          ?.map((g) => g.name) || [],
        hypes: (game.hypes as number) || 0,
      };
    };

    return Response.json({
      recent: (recent || []).map(mapGame),
      upcoming: (upcoming || []).map(mapGame),
    });
  } catch (error) {
    console.error('Releases API error:', error);
    return Response.json({ recent: [], upcoming: [] });
  }
}

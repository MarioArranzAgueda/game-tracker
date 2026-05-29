import { NextRequest } from 'next/server';
import { igdbQuery } from '@/lib/igdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const showDLC = request.nextUrl.searchParams.get('dlc') === '1';
  const showExpansions = request.nextUrl.searchParams.get('expansions') === '1';
  const platformId = request.nextUrl.searchParams.get('platform');

  if (!query || query.trim().length < 2) {
    return Response.json([]);
  }

  const sanitized = query.replace(/"/g, '\\"');

  // game_type values:
  // 0=Main Game, 1=DLC, 2=Expansion, 8=Remake, 9=Remaster, 10=Expanded Game, 11=Port
  const gameTypes = [0, 8, 9, 10, 11]; // Include main games, remakes, remasters, expanded games, and ports
  if (showDLC) gameTypes.push(1);
  if (showExpansions) gameTypes.push(2);

  // Build WHERE clause
  // Note: Don't filter by platform in WHERE clause - IGDB search returns incomplete results
  // We'll filter client-side instead
  let whereClause = `version_parent = null & themes != (42) & game_type = (${gameTypes.join(',')})`;

  const igdbQueryStr = `search "${sanitized}";
     fields 
     name, 
     cover.image_id, 
     total_rating, 
     first_release_date, 
     platforms.id,
     platforms.abbreviation,
     platforms.name,
     platforms.platform_logo.image_id,
     screenshots.image_id,
     rating,
     game_type;
     where ${whereClause};
     limit 50;`;

  let results;
  try {
    results = await igdbQuery('games', igdbQueryStr);
  } catch {
    return Response.json([]);
  }

  // Filter by platform client-side if needed
  if (platformId) {
    const platformIdInt = parseInt(platformId);
    results = results.filter((game: Record<string, unknown>) => {
      const platforms = game.platforms as Array<{ id?: number }> | undefined;
      return platforms?.some(p => p.id === platformIdInt);
    });
    console.log(`After platform filter (${platformId}): ${results.length} games`);
  }

  const games = results.map((game: Record<string, unknown>) => {
    const companies = game.involved_companies as Array<Record<string, unknown>> | undefined;
    const devCompany = companies?.find((ic) => ic.developer);
    const developerName = devCompany
      ? (devCompany.company as Record<string, unknown>)?.name as string | undefined
      : undefined;

    return {
      igdbId: game.id,
      title: game.name,
      cover: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${(game.cover as Record<string, unknown>).image_id}.jpg`
        : null,
      rating: game.total_rating ? Math.round((game.total_rating as number) * 10) / 100 : null,
      year: game.first_release_date
        ? new Date((game.first_release_date as number) * 1000).getFullYear()
        : null,
      description: (game.summary as string) ?? null,
      developer: developerName ?? null,
      category: (game.game_type as number) ?? 0,
      platforms: (game.platforms as Array<{ id?: number; abbreviation?: string; name?: string; platform_logo?: { image_id: string } }> | undefined) || [],
      screenshots: (game.screenshots as Array<{ image_id: string }> | undefined) ?? [],
    };
  });

  return Response.json(games);
}

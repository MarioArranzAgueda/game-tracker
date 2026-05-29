import { NextRequest } from 'next/server';
import { igdbQuery } from '@/lib/igdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ igdbId: string }> }
) {
  const { igdbId } = await params;
  const id = parseInt(igdbId);

  if (isNaN(id)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const query = `
      fields name, summary, storyline, url,
             cover.image_id,
             screenshots.image_id,
             artworks.image_id,
             videos.name, videos.video_id,
             genres.name,
             platforms.name, platforms.abbreviation, platforms.platform_logo.image_id,
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             similar_games.name, similar_games.cover.image_id,
             game_modes.name,
             themes.name,
             player_perspectives.name,
             total_rating, total_rating_count,
             rating, rating_count,
             aggregated_rating, aggregated_rating_count,
             first_release_date,
             category,
             franchises.name,
             game_engines.name,
             websites.url, websites.category;
      where id = ${id};
    `;

    const results = await igdbQuery('games', query);

    if (!results || results.length === 0) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const gameData = results[0];

    const companies = gameData.involved_companies as Record<string, unknown>[] | undefined;
    const devCompany = companies?.find((ic) => ic.developer);
    const pubCompany = companies?.find((ic) => ic.publisher);
    const developerName = (devCompany?.company as Record<string, unknown>)?.name as string | undefined;
    const publisherName = (pubCompany?.company as Record<string, unknown>)?.name as string | undefined;

    // Fetch time to beat
    let timeToBeat = null;
    try {
      const ttbResults = await igdbQuery(
        'game_time_to_beats',
        `fields normally, completely, hastily;
         where game_id = ${id};`
      );
      if (ttbResults && ttbResults.length > 0) {
        const ttb = ttbResults[0];
        timeToBeat = {
          hastily: ttb.hastily ? Math.round(ttb.hastily / 3600) : null,
          normally: ttb.normally ? Math.round(ttb.normally / 3600) : null,
          completely: ttb.completely ? Math.round(ttb.completely / 3600) : null,
        };
      }
    } catch {
      // Time to beat data not available for this game
    }

    console.log({gameData})

    return Response.json({
      igdbId: id,
      title: gameData.name,
      description: gameData.summary || gameData.storyline || null,
      storyline: gameData.storyline || null,
      coverUrl: gameData.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${gameData.cover.image_id}.jpg`
        : null,
      releaseYear: gameData.first_release_date
        ? new Date(gameData.first_release_date * 1000).getFullYear()
        : null,
      developer: developerName || null,
      publisher: publisherName || null,
      avgRating: gameData.total_rating ? parseFloat(gameData.total_rating.toFixed(2)) : null,
      userRating: gameData.rating ? parseFloat(gameData.rating.toFixed(2)) : null,
      criticRating: gameData.aggregated_rating ? parseFloat(gameData.aggregated_rating.toFixed(2)) : null,
      timeToBeat,
      rawData: gameData,
    });
  } catch (error) {
    console.error('Game detail API error:', error);
    return Response.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { igdbQuery } from '@/lib/igdb';

export async function GET(request: NextRequest) {
  try {
    // Juegos populares por hypes
    const query = `
      fields name, cover.image_id, hypes, first_release_date, total_rating, platforms.name, platforms.abbreviation, platforms.platform_logo.image_id, genres.name;
      sort hypes desc;
      where hypes != null & hypes > 1;
      limit 20;
    `;
    const results = await igdbQuery('games', query);
    const games = (results || []).map((game: any) => ({
      igdbId: game.id,
      title: game.name,
      cover: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      hypes: game.hypes || 0,
      releaseYear: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
      avgRating: game.total_rating ? parseFloat(game.total_rating.toFixed(2)) : null,
      platforms: game.platforms || [],
      genres: game.genres || [],
    }));

    console.log({ games });
    return Response.json(games);
  } catch (error) {
    console.error('Popular games error:', error);
    return Response.json([]);
  }
}

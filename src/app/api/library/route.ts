import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { igdbQuery } from '@/lib/igdb';

export async function GET(request: NextRequest) {
  const statusParam = request.nextUrl.searchParams.get('status');

  try {
    const statusArray = statusParam
      ? statusParam.split(",").filter(Boolean)
      : [];
      

    const libraryEntries = await prisma.userLibrary.findMany({
      where: statusArray.length > 0
        ? { status: { in: statusArray as any } }
        : {},
      include: {
        game: true,
      },
      orderBy: { addedAt: 'desc' },
    });

    return Response.json(libraryEntries);
  } catch (error) {
    console.error('List library error:', error);
    return Response.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { igdbId, status = 'WISHLIST' } = await request.json();

    if (!igdbId) {
      return Response.json({ error: 'igdbId is required' }, { status: 400 });
    }

    // Ensure game exists in DB — fetch from IGDB if not, or update if rawData is stale
    let game = await prisma.game.findUnique({
      where: { igdbId },
    });

    const needsRefresh = !game || !game.rawData || !(game.rawData as any).platforms || !(game.rawData as any).screenshots || !(game.rawData as any).artworks;

    if (needsRefresh) {
      const query = `
        fields name, summary, storyline, cover.image_id,
               involved_companies.company.name, involved_companies.developer,
               total_rating, first_release_date,
               genres.name, platforms.name, platforms.abbreviation, platforms.platform_logo.image_id,
               screenshots.image_id, artworks.image_id;
        where id = ${igdbId};
      `;
      const results = await igdbQuery('games', query);

      if (!results || results.length === 0) {
        if (!game) return Response.json({ error: 'Game not found on IGDB' }, { status: 404 });
      } else {
        const g = results[0];
        const companies = g.involved_companies as Record<string, unknown>[] | undefined;
        const devCompany = companies?.find((ic) => ic.developer);
        const developerName = (devCompany?.company as Record<string, unknown>)?.name as string | undefined;

        const data = {
          igdbId,
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
        };

        if (game) {
          game = await prisma.game.update({ where: { igdbId }, data });
        } else {
          game = await prisma.game.create({ data });
        }
      }
    }

    // Buscar si ya existe una entrada para este juego
    let entry = await prisma.userLibrary.findFirst({
      where: { gameId: igdbId },
      include: { game: true },
    });

    if (entry) {
      // Si existe, actualizar el status
      entry = await prisma.userLibrary.update({
        where: { id: entry.id },
        data: { status: status as any },
        include: { game: true },
      });
      return Response.json(entry, { status: 200 });
    } else {
      // Si no existe, crear nueva entrada
      entry = await prisma.userLibrary.create({
        data: {
          gameId: igdbId,
          status: status as any,
        },
        include: {
          game: true,
        },
      });
      return Response.json(entry, { status: 201 });
    }
  } catch (error) {
    console.error('Add to library error:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return Response.json(
      { 
        error: 'Database unavailable. Library features require a running database.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

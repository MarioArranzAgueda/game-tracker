import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [counts, totalDuration, genresData] = await Promise.all([
      // 1. Counts by status
      prisma.userLibrary.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // 2. Sum of duration hours
      prisma.game.aggregate({
        _sum: { durationHours: true },
        where: { userLibrary: { some: {} } },
      }),
      // 3. Simple genres fetch for top genres
      prisma.game.findMany({
        where: { userLibrary: { some: {} } },
        select: { rawData: true },
      }),
    ]);

    // Format counts
    const statusCounts = counts.reduce(
      (acc: Record<string, number>, curr: { status: string; _count: { status: number } }) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    // Process genres from JSONB
    const genreMap = genresData
      .flatMap((g: { rawData: any }) => ((g.rawData as any)?.genres as any[] | undefined) || [])
      .reduce((acc: Record<string, number>, genre: any) => {
        acc[genre.name] = (acc[genre.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, value: count }));

    // Average rating
    const ratings = genresData
      .map((g: { rawData: any }) => (g.rawData as any)?.total_rating as number | undefined)
      .filter((r): r is number => r != null && !isNaN(r));
    const avgRating = ratings.length > 0
      ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
      : null;

    // Year breakdown
    const yearMap: Record<number, number> = {};
    genresData.forEach((g: { rawData: any }) => {
      const ts = (g.rawData as any)?.first_release_date as number | undefined;
      if (ts) {
        const year = new Date(ts * 1000).getFullYear();
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });
    const yearCounts = Object.entries(yearMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, count]) => ({ year: Number(year), value: count }));

    // Process platforms from JSONB
    const platformMap = genresData
      .flatMap((g: { rawData: any }) => ((g.rawData as any)?.platforms as any[] | undefined) || [])
      .filter((platform: any) => platform.name || platform.abbreviation)
      .reduce((acc: Record<string, { count: number; abbreviation?: string }>, platform: any) => {
        const platformName = platform.name || platform.abbreviation;
        if (!acc[platformName]) {
          acc[platformName] = { 
            count: 0, 
            abbreviation: platform.abbreviation 
          };
        }
        acc[platformName].count += 1;
        return acc;
      }, {} as Record<string, { count: number; abbreviation?: string }>);

    const platformCounts = Object.entries(platformMap)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ 
        name, 
        abbreviation: data.abbreviation,
        value: data.count 
      }));

    return Response.json({
      statusCounts,
      totalDurationHours: totalDuration._sum.durationHours || 0,
      topGenres,
      platformCounts,
      avgRating,
      yearCounts,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return Response.json({
      statusCounts: {},
      totalDurationHours: 0,
      topGenres: [],
      platformCounts: [],
    });
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return Response.json({ error: 'updates array is required' }, { status: 400 });
    }

    // Update sortOrder for each entry
    await Promise.all(
      updates.map((update: { id: number; sortOrder: number }) =>
        prisma.userLibrary.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        })
      )
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Reorder library error:', error);
    return Response.json(
      { error: 'Failed to reorder library entries' },
      { status: 500 }
    );
  }
}

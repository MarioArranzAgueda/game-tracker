import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryId = parseInt(id);

  if (isNaN(entryId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { status, personalScore, personalNotes, isFavorite } = await request.json();

    // Set lastPlayedAt when status changes to IN_PROGRESS or COMPLETED
    const shouldUpdateLastPlayed = status === 'IN_PROGRESS' || status === 'COMPLETED' || status === 'FULL_COMPLETION';

    // Build data object dynamically to avoid undefined values
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status as any;
    }

    if (personalScore !== undefined) {
      updateData.personalScore = personalScore === null ? null : parseFloat(personalScore);
    }

    if (personalNotes !== undefined) {
      updateData.personalNotes = personalNotes;
    }

    if (isFavorite !== undefined) {
      updateData.isFavorite = isFavorite;
    }

    if (shouldUpdateLastPlayed) {
      updateData.lastPlayedAt = new Date();
    }

    const entry = await prisma.userLibrary.update({
      where: { id: entryId },
      data: updateData,
      include: {
        game: true,
      },
    });

    return Response.json(entry);
  } catch (error) {
    console.error('Update library error:', error);
    // Log the actual error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryId = parseInt(id);

  if (isNaN(entryId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.userLibrary.delete({
      where: { id: entryId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete library error:', error);
    return Response.json(
      { error: 'Database unavailable. Library features require a running database.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}

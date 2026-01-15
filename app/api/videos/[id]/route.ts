import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const videoId = params.id;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const response = await fetch(`${BACKEND_URL}/videos/${videoId}?user_id=${encodeURIComponent(session.user.id)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    const videoData = await response.json();

    // REFUND LOGIC: If status is 'failed', decrement the count if not already refunded
    if (videoData.status === 'failed') {
      const alreadyRefunded = await prisma.refundedVideo.findUnique({
        where: { videoId: String(videoId) }
      });

      if (!alreadyRefunded) {
        // Only refund if user has a positive count (prevents going negative)
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user && user.generationsCount > 0) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: session.user.id },
              data: {
                generationsCount: {
                  decrement: 1
                }
              }
            }),
            prisma.refundedVideo.create({
              data: { videoId: String(videoId), userId: session.user.id }
            })
          ]);
        }
      }
    }

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // No refund on delete - credits are consumed when video is created
    const response = await fetch(`${BACKEND_URL}/videos/${id}?user_id=${encodeURIComponent(session.user.id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(`Delete video ${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

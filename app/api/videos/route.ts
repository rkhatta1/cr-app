import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const response = await fetch(`${BACKEND_URL}/videos?user_id=${encodeURIComponent(session.user.id)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('List videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // 1. Atomically check and increment the count (prevents race condition)
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
        generationsCount: { lt: 2 } // Only update if less than 2
      },
      data: { generationsCount: { increment: 1 } }
    }).catch(() => null);

    if (!user) {
      // Either user doesn't exist or limit reached
      const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Generation limit reached' }, { status: 403 });
    }

    // 2. Call GCP Backend to start processing (include user_id)
    try {
      const response = await fetch(`${BACKEND_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, user_id: session.user.id }),
      });

      if (!response.ok) {
        // Backend failed - ROLLBACK the increment
        await prisma.user.update({
          where: { id: session.user.id },
          data: { generationsCount: { decrement: 1 } }
        });

        const error = await response.json().catch(() => ({ error: 'Backend error' }));
        return NextResponse.json(error, { status: response.status });
      }

      const videoData = await response.json();
      return NextResponse.json(videoData, { status: 201 });

    } catch (error) {
      // Network/exception error - ROLLBACK the increment
      await prisma.user.update({
        where: { id: session.user.id },
        data: { generationsCount: { decrement: 1 } }
      });
      throw error;
    }
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
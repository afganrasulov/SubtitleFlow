import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const video = await prisma.video.findUnique({
        where: { id: params.id },
        include: {
            subtitles: true,
            aiJobs: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
}

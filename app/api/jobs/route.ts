import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiQueue } from '@/lib/queues';

export async function POST(request: Request) {
    const { type, videoItemId, projectId } = await request.json();

    let transcript = '';

    if (videoItemId) {
        const subtitle = await prisma.subtitle.findFirst({
            where: { videoItemId },
            orderBy: { createdAt: 'desc' }
        });
        if (!subtitle) {
            return NextResponse.json({ error: 'No transcript found for this video' }, { status: 400 });
        }
        transcript = subtitle.contentText;
    }

    const job = await prisma.aIJob.create({
        data: {
            type,
            videoItemId,
            projectId,
            status: 'pending'
        }
    });

    await aiQueue.add('ai-job', {
        type,
        jobId: job.id,
        videoItemId,
        projectId,
        transcript
    });

    return NextResponse.json(job);
}

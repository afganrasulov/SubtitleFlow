import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: {
            videos: {
                orderBy: { createdAt: 'desc' },
                include: { subtitles: true }
            },
            aiJobs: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { videos: true }
            }
        }
    });
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const { name } = await request.json();
    const project = await prisma.project.create({
        data: { name }
    });
    return NextResponse.json(project);
}

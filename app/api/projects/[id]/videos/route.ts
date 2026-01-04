import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseYoutubeUrl, fetchPlaylistVideos, fetchVideoDetails } from '@/lib/youtube';
import { youtubeQueue } from '@/lib/queues';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { url } = await request.json();
    const { videoId, playlistId } = parseYoutubeUrl(url);
    const apiKey = process.env.YOUTUBE_API_KEY!;

    if (!videoId && !playlistId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    if (playlistId) {
        const videos = await fetchPlaylistVideos(playlistId, apiKey);

        // Create multiple videos in background
        for (const v of videos) {
            const video = await prisma.video.upsert({
                where: { projectId_youtubeVideoId: { projectId: params.id, youtubeVideoId: v.videoId } },
                update: {},
                create: {
                    projectId: params.id,
                    youtubeVideoId: v.videoId,
                    title: v.title,
                    url: v.url,
                    status: 'pending'
                }
            });

            await youtubeQueue.add('fetch-transcript', {
                type: 'fetch-transcript',
                videoId: v.videoId,
                videoItemId: video.id
            });
        }

        return NextResponse.json({ message: `Added ${videos.length} videos from playlist` });
    } else if (videoId) {
        const details = await fetchVideoDetails(videoId, apiKey);
        const video = await prisma.video.upsert({
            where: { projectId_youtubeVideoId: { projectId: params.id, youtubeVideoId: videoId } },
            update: {},
            create: {
                projectId: params.id,
                youtubeVideoId: videoId,
                title: details.title!,
                url: details.url,
                status: 'pending'
            }
        });

        await youtubeQueue.add('fetch-transcript', {
            type: 'fetch-transcript',
            videoId: videoId,
            videoItemId: video.id
        });

        return NextResponse.json(video);
    }

    return NextResponse.json({ error: 'Unsupported URL' }, { status: 400 });
}
